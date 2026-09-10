
const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const CONFUSION_HINTS = {
  "本":{"木":"「本」は「木」に、ねもとを表す短い横線が1本あるよ。"},
  "木":{"本":"「木」には、下の短い横線はないよ。"},
  "未":{"末":"「未」は、上の横線より下の横線のほうが長いよ。"},
  "末":{"未":"「末」は、いちばん上の横線が長いよ。"},
  "土":{"士":"「土」は、下の横線のほうが長いよ。"},
  "士":{"土":"「士」は、上の横線のほうが長いよ。"},
  "大":{"太":"「大」には下の点はないよ。","犬":"「大」には右上の点はないよ。"},
  "太":{"大":"「太」は下に点が1つあるよ。"},
  "犬":{"大":"「犬」は右上に点があるよ。"},
  "王":{"玉":"「王」には点はないよ。"},
  "玉":{"王":"「玉」には点が1つあるよ。"},
  "待":{"持":"「待」の左は、ぎょうにんべんだよ。"},
  "持":{"待":"「持」の左は、てへんだよ。"},
  "晴":{"清":"「晴」の左は、ひへんだよ。"},
  "清":{"晴":"「清」の左は、さんずいだよ。"}
};

function cors(req,res){
  const allowed = (process.env.ALLOWED_ORIGIN || "*").trim();
  const origin = req.headers.origin || "";

  if (allowed === "*") {
    res.setHeader("Access-Control-Allow-Origin","*");
  } else if (origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary","Origin");
  }

  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  res.setHeader("Cache-Control","no-store");
}
function json(req,res,status,obj){
  cors(req,res);
  res.status(status).json(obj);
}
function validateBody(body){
  if(!body || typeof body.expected!=="string" || [...body.expected].length!==1) return "expected";
  if(JSON.stringify(body).length > 1_500_000) return "payload_too_large";
  if(!Array.isArray(body.strokes) || body.strokes.length===0 || body.strokes.length>40) return "strokes";
  let points=0;
  for(const stroke of body.strokes){
    if(!Array.isArray(stroke) || stroke.length===0 || stroke.length>3000) return "stroke";
    points += stroke.length;
    for(const p of stroke){
      if(!Number.isFinite(p.x)||!Number.isFinite(p.y)) return "point";
    }
  }
  if(points>12000) return "too_many_points";
  return null;
}
function svgFromStrokes(strokes,canvas){
  const W=512,H=512;
  const cw=Math.max(1,Number(canvas?.width)||512), ch=Math.max(1,Number(canvas?.height)||512);
  const sx=W/cw, sy=H/ch;
  const paths=strokes.map(stroke=>{
    const pts=stroke.map(p=>`${(p.x*sx).toFixed(1)},${(p.y*sy).toFixed(1)}`).join(" ");
    return `<polyline points="${pts}" fill="none" stroke="#111" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="100%" height="100%" fill="white"/>
    ${paths}
  </svg>`;
}
function dataUrl(svg){
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
function cleanModelResult(x,expected){
  const allowed=new Set(["excellent","accepted","revise","uncertain"]);
  if(!allowed.has(x?.status)) return {status:"uncertain",recognizedText:null,message:"AIが判断できませんでした。",hint:null};
  if(typeof x.recognizedText!=="string" && x.recognizedText!==null) x.recognizedText=null;
  if(typeof x.message!=="string") x.message="";
  if(typeof x.hint!=="string" && x.hint!==null) x.hint=null;

  // Safety guard: the model cannot award a pass if it says a different character.
  if((x.status==="excellent"||x.status==="accepted") && x.recognizedText!==expected){
    x.status="uncertain";
    x.message="正しい漢字か自信をもって判断できなかったよ。もう一度ゆっくり書いてみよう。";
    x.hint=null;
  }

  // Deterministic educational hint for known confusions.
  if(x.status==="revise" && x.recognizedText && CONFUSION_HINTS[expected]?.[x.recognizedText]){
    x.hint=CONFUSION_HINTS[expected][x.recognizedText];
  }
  return x;
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method==="GET") return json(req,res,200,{status:"ok",service:"kanjiquest-handwriting",version:"0.2"});
  if(req.method!=="POST") return json(req,res,405,{status:"error"});

  if(!process.env.OPENAI_API_KEY){
    return json(req,res,503,{status:"uncertain",recognizedText:null,message:"AIサービスの設定がまだ完了していません。",hint:null});
  }

  const error=validateBody(req.body);
  if(error) return json(req,res,400,{status:"uncertain",recognizedText:null,message:"手書きデータを確認できませんでした。",hint:null});

  const expected=req.body.expected;
  const svg=svgFromStrokes(req.body.strokes,req.body.canvas);
  const image=dataUrl(svg);

  const schema={
    type:"object",
    additionalProperties:false,
    required:["status","recognizedText","message","hint"],
    properties:{
      status:{type:"string",enum:["excellent","accepted","revise","uncertain"]},
      recognizedText:{anyOf:[{type:"string"},{type:"null"}]},
      message:{type:"string"},
      hint:{anyOf:[{type:"string"},{type:"null"}]}
    }
  };

  const instructions = `あなたは小学生の日本語漢字書字を判定する教育用アシスタントです。
期待する漢字は「${expected}」です。画像は児童の手書きストロークだけを白地に描画したものです。

最重要ルール:
- 字の美しさではなく、漢字として重要な骨格が正しいかを見る。
- 少し線がはみ出す、少し離れる、少し曲がる、中心が少しずれる程度は不正解理由にしない。
- 明確に「${expected}」と読め、重要な部品が保たれていれば excellent または accepted。
- よく似た別字に見える、重要な画・点・部首が違う場合は revise。
- 自信がない場合は uncertain。無理に×をつけない。
- excellent はかなり明確な正字。accepted は多少の崩れがある正字。
- recognizedText は最もそう見える1文字。判断できなければ null。
- message は児童向けに短く、やさしい日本語。
- hint は直す箇所が明確な場合のみ。細かすぎる書写指導はしない。`;

  try{
    const apiRes=await fetch(OPENAI_URL,{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:MODEL,
        store:false,
        max_output_tokens:300,
        reasoning:{effort:"low"},
        input:[{
          role:"user",
          content:[
            {type:"input_text",text:instructions},
            {type:"input_image",image_url:image,detail:"high"}
          ]
        }],
        text:{
          format:{
            type:"json_schema",
            name:"kanji_handwriting_judgment",
            strict:true,
            schema
          }
        }
      })
    });

    if(!apiRes.ok){
      console.error("OpenAI error",apiRes.status,await apiRes.text());
      return json(req,res,200,{status:"uncertain",recognizedText:null,message:"AIがうまく判断できなかったよ。もう一度ためしてね。",hint:null});
    }

    const response=await apiRes.json();
    const text=response.output?.flatMap(x=>x.content||[]).find(x=>x.type==="output_text")?.text;
    if(!text) return json(req,res,200,{status:"uncertain",recognizedText:null,message:"AIが判断できませんでした。",hint:null});

    let parsed;
    try{ parsed=JSON.parse(text); }
    catch{ return json(req,res,200,{status:"uncertain",recognizedText:null,message:"AIが判断できませんでした。",hint:null}); }

    return json(req,res,200,cleanModelResult(parsed,expected));
  }catch(e){
    console.error(e);
    return json(req,res,200,{status:"uncertain",recognizedText:null,message:"通信に問題があったよ。×にはしないので、もう一度ためしてね。",hint:null});
  }
}
