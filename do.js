const globals = new Set();

try{globals.add(global);}catch{}
try{globals.add(globalThis);}catch{}
try{globals.add(self);}catch{}
try{globals.add(window);}catch{}
try{globals.add(this);}catch{}
try{globals.add(document);}catch{}
try{globals.add(Object);}catch{}

const walkProps = (obj,props) =>{
  let lastRes;
  let res = obj;
  for(const prop of props){
    lastRes = res;
    res = res?.[prop];
  }
  if(lastRes && (typeof res === 'function')){
    res = res.bind(lastRes);
  }
  return res;
};

const findProp = name =>{
  const keys = name.split('.');
  for(const obj of globals){
    const res = walkProps(obj,keys);
    if(res){
      return res;
    }
  }
};
const isArray = x => Array.isArray(x) || x instanceof Array;
const isString = x => typeof x === 'string' || x instanceof String;

function $do(commands,args){
  if(isString(commands)){
    args ??=[];
    if(!isArray(args)){
      args = [args];
    }
    return findProp(commands)(...args);
  }
  if(!isArray(commands)){
    commands = [commands];
  }
  let res;
  for(const cmd of commands){
    const parts = Object.entries(cmd);
    const fn = findProp(cmd[0]);
    const args = cmd[1];
    res = fn(...args);
  }
  return res;
}
