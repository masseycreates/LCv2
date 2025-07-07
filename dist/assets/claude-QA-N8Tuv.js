import{C as l,v as d,E as m,h}from"./lottery-Dl5XWKmO.js";class g{constructor(){this.apiKey=null,this.baseURL="https://api.anthropic.com/v1/messages",this.isEnabled=!1,this.retryCount=0,this.maxRetries=3,this.hybridMode=!0,this.requestCount=0,this.lastRequestTime=0,this.rateLimitDelay=1e3}initialize(t){if(!d(t))throw new Error(m.invalidApiKey);this.apiKey=t,this.isEnabled=!0,this.requestCount=0,console.log("?? Claude Sonnet 4 initialized with hybrid system"),console.log("?? API endpoint configured:",this.baseURL)}validateApiKey(t){return d(t)}disconnect(){this.apiKey=null,this.isEnabled=!1,this.requestCount=0,console.log("?? Claude API disconnected")}async testConnection(){var t;if(!this.apiKey||!this.isEnabled)return{success:!1,error:m.apiKeyRequired,status:"disabled"};try{console.log("?? Testing Claude Sonnet 4 connection...");const e={model:l.model,max_tokens:100,temperature:.3,messages:[{role:"user",content:'Hello! Please respond with just "Connected" to confirm the API is working.'}]},s=await this.makeAPIRequest(e);if(s.success&&s.data.content){const a=((t=s.data.content[0])==null?void 0:t.text)||"";return{success:!0,message:"Claude Sonnet 4 connection successful",model:l.model,responseTime:s.responseTime,usage:s.data.usage}}else throw new Error(s.error||"Invalid response format")}catch(e){return console.error("? Claude connection test failed:",e),{success:!1,error:e.message,status:"error"}}}async generateHybridSelection(t){if(!this.isEnabled)throw new Error("Claude API not enabled");const{historicalData:e,currentJackpot:s,requestedSets:a=5,strategy:n="hybrid",localAlgorithmResults:r=[]}=t;try{console.log(`??? Generating ${a} Claude hybrid selections...`);const o=this.buildHybridSelectionPrompt({historicalData:e,currentJackpot:s,requestedSets:a,strategy:n,localAlgorithmResults:r}),i={model:l.model,max_tokens:l.maxTokens.hybrid,temperature:l.temperature,messages:[{role:"user",content:o}]},c=await this.makeAPIRequest(i);if(c.success)return{success:!0,data:this.processHybridSelectionResponse(c.data.content[0].text,a,r),usage:c.data.usage,model:l.model};throw new Error(c.error)}catch(o){return console.error("? Claude hybrid selection failed:",o),{success:!1,error:o.message,fallbackUsed:!0}}}buildHybridSelectionPrompt(t){const{historicalData:e,currentJackpot:s,requestedSets:a,localAlgorithmResults:n}=t;return`You are an advanced lottery analysis AI assistant. I need you to generate ${a} Powerball lottery number sets by combining mathematical algorithms with AI insights.

POWERBALL RULES:
- Select 5 main numbers from 1-69 (no duplicates)
- Select 1 Powerball number from 1-26
- Numbers must be realistic and mathematically sound

CURRENT CONTEXT:
- Current Jackpot: $${s!=null&&s.amount?(s.amount/1e6).toFixed(0)+"M":"100M"}
- Historical Data: ${(e==null?void 0:e.totalDrawings)||0} drawings analyzed
- Analysis Date: ${new Date().toLocaleDateString()}

LOCAL ALGORITHM RESULTS:
${n.map((r,o)=>{var i;return`Algorithm ${o+1}: ${(i=r.numbers)==null?void 0:i.join(", ")} | PB: ${r.powerball} (${r.confidence}% confidence)`}).join(`
`)}

HISTORICAL PATTERNS:
${e!=null&&e.hotNumbers?`Hot Numbers: ${e.hotNumbers.slice(0,10).map(r=>r.number).join(", ")}`:""}
${e!=null&&e.coldNumbers?`Cold Numbers: ${e.coldNumbers.slice(0,10).map(r=>r.number).join(", ")}`:""}

TASK:
Generate ${a} optimized Powerball selections that:
1. Consider the mathematical algorithm results above
2. Apply AI pattern recognition and intuition
3. Balance statistical probability with creative insights
4. Ensure variety across the ${a} sets

For each selection, provide:
- 5 main numbers (1-69)
- 1 Powerball number (1-26)  
- Confidence level (65-95%)
- Brief strategy explanation
- AI insights or reasoning

Format your response as a JSON array like this:
[
  {
    "numbers": [1, 2, 3, 4, 5],
    "powerball": 1,
    "confidence": 85,
    "name": "Claude Enhanced Pattern",
    "description": "AI-enhanced prediction combining algorithm insights",
    "insights": "Key reasoning for this selection",
    "algorithmDetail": "Specific mathematical approach used"
  }
]

Focus on quality over quantity. Each selection should be thoughtfully crafted with clear reasoning.`}processHybridSelectionResponse(t,e,s){try{const a=t.match(/\[[\s\S]*\]/);if(!a)throw new Error("No valid JSON found in Claude response");const n=JSON.parse(a[0]);if(!Array.isArray(n))throw new Error("Invalid JSON format from Claude");const r=n.filter(o=>this.validateClaudeSelection(o)).slice(0,e).map((o,i)=>({numbers:o.numbers.sort((c,u)=>c-u),powerball:o.powerball,confidence:Math.min(95,Math.max(65,o.confidence||80)),name:o.name||`Claude Enhanced ${i+1}`,description:o.description||"AI-enhanced prediction",algorithmDetail:o.algorithmDetail||"Claude Sonnet 4 analysis",insights:o.insights||"Advanced pattern recognition",actualStrategy:"Claude AI Enhanced",technicalAnalysis:t.substring(0,200)+"...",claudeGenerated:!0,isHybrid:!0,source:"claude-ai"}));for(;r.length<e&&s.length>0;){const o=r.length%s.length,i=s[o];r.push({numbers:i.numbers,powerball:i.powerball,confidence:i.confidence||75,name:`Enhanced ${i.strategy||"Algorithm"}`,description:"Mathematical algorithm enhanced by Claude AI context",algorithmDetail:i.analysis||"Mathematical analysis",insights:"Fallback from local algorithms",actualStrategy:i.strategy||"Algorithm",technicalAnalysis:i.analysis||"Mathematical analysis",claudeGenerated:!1,isHybrid:!0,source:"algorithm-fallback"})}return{selections:r,analysis:this.extractAnalysisFromResponse(t),model:l.model,timestamp:new Date().toISOString()}}catch(a){return console.error("Failed to process Claude response:",a),this.createFallbackHybridResponse(s,e)}}validateClaudeSelection(t){return t&&Array.isArray(t.numbers)&&t.numbers.length===5&&t.numbers.every(e=>Number.isInteger(e)&&e>=1&&e<=69)&&Number.isInteger(t.powerball)&&t.powerball>=1&&t.powerball<=26&&new Set(t.numbers).size===5}extractAnalysisFromResponse(t){const e=t.match(/\[[\s\S]*\]/);if(!e)return t.substring(0,500);const s=t.substring(0,e.index).trim(),a=t.substring(e.index+e[0].length).trim();return(s+" "+a).trim().substring(0,500)}createFallbackHybridResponse(t,e){return{selections:t.slice(0,e).map((a,n)=>({numbers:a.numbers,powerball:a.powerball,confidence:a.confidence||75,name:`Enhanced ${a.strategy||`Algorithm ${n+1}`}`,description:"Local algorithm with AI enhancement context",algorithmDetail:a.analysis||"Mathematical analysis",insights:"Processed through Claude AI framework",actualStrategy:a.strategy||"Algorithm",technicalAnalysis:a.analysis||"Mathematical analysis",claudeGenerated:!1,isHybrid:!0,source:"algorithm-enhanced"})),analysis:"Claude AI processing failed, using enhanced algorithm results",model:"fallback",timestamp:new Date().toISOString()}}async generateQuickSelection(t){if(!this.isEnabled)throw new Error("Claude API not enabled");const{historicalData:e,currentJackpot:s,requestedSets:a=3,strategy:n="quick"}=t;try{const r=this.buildQuickSelectionPrompt({historicalData:e,currentJackpot:s,requestedSets:a,strategy:n}),o={model:l.model,max_tokens:l.maxTokens.quick,temperature:l.temperature+.1,messages:[{role:"user",content:r}]},i=await this.makeAPIRequest(o);if(i.success)return{success:!0,data:this.processQuickSelectionResponse(i.data.content[0].text,a),usage:i.data.usage};throw new Error(i.error)}catch(r){return console.error("? Claude quick selection failed:",r),{success:!1,error:r.message}}}buildQuickSelectionPrompt(t){const{historicalData:e,currentJackpot:s,requestedSets:a}=t;return`Generate ${a} quick Powerball lottery selections using AI analysis.

RULES: 5 numbers (1-69) + 1 Powerball (1-26)
JACKPOT: $${s!=null&&s.amount?(s.amount/1e6).toFixed(0)+"M":"100M"}
DATA: ${(e==null?void 0:e.totalDrawings)||0} historical drawings

Use your AI capabilities to identify patterns and generate mathematically sound selections.

Return only a JSON array:
[{"numbers": [1,2,3,4,5], "powerball": 1, "confidence": 80}]`}processQuickSelectionResponse(t,e){try{const s=t.match(/\[[\s\S]*\]/);if(!s)throw new Error("No JSON found");return{selections:JSON.parse(s[0]).filter(n=>this.validateClaudeSelection(n)).slice(0,e).map((n,r)=>({...n,numbers:n.numbers.sort((o,i)=>o-i),name:`Claude Quick ${r+1}`,claudeGenerated:!0})),timestamp:new Date().toISOString()}}catch{return this.generateFallbackQuickSelections(e)}}async generatePredictionInsights(t){if(!this.isEnabled)throw new Error("Claude API not enabled");const{predictionSet:e,historicalContext:s}=t;try{const a=this.buildInsightsPrompt(e,s),n={model:l.model,max_tokens:l.maxTokens.insights,temperature:.3,messages:[{role:"user",content:a}]},r=await this.makeAPIRequest(n);if(r.success)return{success:!0,data:{insights:r.data.content[0].text,analysis:this.extractKeyInsights(r.data.content[0].text),timestamp:new Date().toISOString()},usage:r.data.usage};throw new Error(r.error)}catch(a){return console.error("? Claude insights generation failed:",a),{success:!1,error:a.message}}}buildInsightsPrompt(t,e){return`Analyze this Powerball prediction and provide insights:

PREDICTION: ${t.numbers.join(", ")} | Powerball: ${t.powerball}
STRATEGY: ${t.strategy}
CONFIDENCE: ${t.confidence}%

HISTORICAL CONTEXT:
- Total drawings analyzed: ${e.totalDrawings}
- Recent trends: ${e.recentTrends||"Standard patterns"}

Provide a brief analysis covering:
1. Mathematical soundness of the selection
2. Pattern recognition insights
3. Statistical probability assessment
4. Strategic reasoning

Keep the response concise (2-3 paragraphs) and focused on actionable insights.`}extractKeyInsights(t){var s,a;const e=t.split(/[.!?]+/).filter(n=>n.trim().length>10);return{summary:((s=e[0])==null?void 0:s.trim())||"AI analysis completed",keyPoints:e.slice(1,4).map(n=>n.trim()).filter(n=>n.length>0),recommendation:((a=e[e.length-1])==null?void 0:a.trim())||"Consider mathematical patterns"}}async makeAPIRequest(t){await this.enforceRateLimit();const e=performance.now();try{const s=await fetch(this.baseURL,{method:"POST",headers:{"x-api-key":this.apiKey,"anthropic-version":l.version,"content-type":"application/json"},body:JSON.stringify(t)}),a=performance.now()-e;if(this.requestCount++,this.lastRequestTime=Date.now(),!s.ok){const r=await s.text();let o=`HTTP ${s.status}: ${s.statusText}`;try{const i=JSON.parse(r);i.error&&i.error.message&&(o=i.error.message)}catch{}throw new Error(o)}return{success:!0,data:await s.json(),responseTime:a,requestCount:this.requestCount}}catch(s){return console.error("Claude API request failed:",s),{success:!1,error:h(s),responseTime:performance.now()-e}}}async enforceRateLimit(){const t=Date.now()-this.lastRequestTime;if(t<this.rateLimitDelay){const e=this.rateLimitDelay-t;console.log(`? Rate limiting: waiting ${e}ms...`),await new Promise(s=>setTimeout(s,e))}}generateFallbackQuickSelections(t){const e=[];for(let s=0;s<t;s++){const a=[];for(;a.length<5;){const n=Math.floor(Math.random()*69)+1;a.includes(n)||a.push(n)}e.push({numbers:a.sort((n,r)=>n-r),powerball:Math.floor(Math.random()*26)+1,confidence:70+Math.floor(Math.random()*15),name:`Fallback Quick ${s+1}`,claudeGenerated:!1})}return{selections:e,timestamp:new Date().toISOString(),fallback:!0}}getStatus(){return{isEnabled:this.isEnabled,model:l.model,requestCount:this.requestCount,lastRequestTime:this.lastRequestTime,rateLimitDelay:this.rateLimitDelay,maxRetries:this.maxRetries,hybridMode:this.hybridMode}}getDiagnostics(){return{status:this.isEnabled?"enabled":"disabled",model:l.model,version:l.version,features:["hybridSelection","quickSelection","predictionInsights"],requestCount:this.requestCount,lastRequestTime:this.lastRequestTime?new Date(this.lastRequestTime).toISOString():null,configuration:{maxTokens:l.maxTokens,temperature:l.temperature,rateLimitDelay:this.rateLimitDelay}}}setRateLimit(t){this.rateLimitDelay=Math.max(500,t),console.log(`?? Claude API rate limit set to ${this.rateLimitDelay}ms`)}enableHybridMode(t=!0){this.hybridMode=t,console.log(`?? Claude hybrid mode ${t?"enabled":"disabled"}`)}resetRequestCount(){this.requestCount=0,console.log("?? Claude API request count reset")}}const y=new g;console.log("?? ClaudeAPI service initialized");console.log(`?? Model: ${l.model}`);console.log("?? Features: Hybrid Selection, Quick Selection, Prediction Insights");export{y as c};
//# sourceMappingURL=claude-QA-N8Tuv.js.map
