import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import { parse } from 'acorn';

const root=process.cwd();
const src=path.join(root,'index.html');
const dist=path.join(root,'dist');
const audit=path.join(root,'.build-audit');

fs.rmSync(dist,{recursive:true,force:true});
fs.rmSync(audit,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
fs.mkdirSync(audit,{recursive:true});

if(!fs.existsSync(src))throw new Error('index.html is missing');

function copyDir(from,to){
  fs.mkdirSync(to,{recursive:true});
  for(const entry of fs.readdirSync(from,{withFileTypes:true})){
    const a=path.join(from,entry.name),b=path.join(to,entry.name);
    if(entry.isDirectory())copyDir(a,b);else fs.copyFileSync(a,b);
  }
}

if(!fs.existsSync(path.join(root,'audio')))throw new Error('audio directory is missing');
copyDir(path.join(root,'audio'),path.join(dist,'audio'));
if(!fs.existsSync(path.join(root,'assets','player')))throw new Error('player artwork is missing');
copyDir(path.join(root,'assets','player'),path.join(dist,'assets','player'));

const coreJs=path.join(root,'node_modules','core-js-bundle','minified.js');
const regenerator=path.join(root,'node_modules','regenerator-runtime','runtime.js');
if(!fs.existsSync(coreJs)||!fs.existsSync(regenerator))throw new Error('legacy runtime dependencies are missing');
fs.copyFileSync(coreJs,path.join(dist,'core-js.min.js'));
fs.copyFileSync(regenerator,path.join(dist,'regenerator-runtime.js'));

let html=fs.readFileSync(src,'utf8');
let scriptNo=0;
html=html.replace(/<script(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi,(full,attrs,code)=>{
  if(!code.trim())return full;
  scriptNo++;
  const out=transformSync(code,{
    filename:'inline-'+scriptNo+'.js',
    sourceType:'script',
    comments:false,
    compact:false,
    presets:[[presetEnv,{
      targets:{ie:'11'},
      modules:false,
      bugfixes:true
    }]]
  });
  if(!out||typeof out.code!=='string')throw new Error('Babel produced no output for script '+scriptNo);
  parse(out.code,{ecmaVersion:5,sourceType:'script',allowReserved:true});
  fs.writeFileSync(path.join(audit,'script-'+scriptNo+'.js'),out.code);
  return '<script'+attrs+'>'+out.code+'</script>';
});

if(scriptNo<3)throw new Error('Expected at least 3 inline scripts, found '+scriptNo);
html=html.replace(/<script(?![^>]*\bsrc\s*=)/i,'<script src="core-js.min.js"></script>\n<script src="regenerator-runtime.js"></script>\n<script');
fs.writeFileSync(path.join(dist,'index.html'),html);

const invalid=[];
let total=0;
function scan(dir,rel=''){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const nextRel=rel?rel+'/'+entry.name:entry.name;
    if(/[\sА-Яа-яЁё]/.test(entry.name))invalid.push(nextRel);
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())scan(full,nextRel);else total+=fs.statSync(full).size;
  }
}
scan(dist);
if(invalid.length)throw new Error('Invalid Yandex file names: '+invalid.join(', '));
if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('dist/index.html is missing');
const limit=100*1024*1024;
if(total>limit)throw new Error('Uncompressed build exceeds 100 MB: '+total);

const output=fs.readFileSync(path.join(dist,'index.html'),'utf8');
if(!output.includes("core-js.min.js")||!output.includes("regenerator-runtime.js"))throw new Error('Legacy runtimes were not injected');
if(/new\s+URLSearchParams\s*\(/.test(output))throw new Error('URLSearchParams dependency survived release build');

console.log(JSON.stringify({
  inlineScripts:scriptNo,
  uncompressedBytes:total,
  uncompressedMB:(total/1024/1024).toFixed(2),
  files:fs.readdirSync(dist),
  target:'ES5 syntax + runtime fallbacks for Yandex legacy environments'
},null,2));
