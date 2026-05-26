const globals = new Set();
const _do = Object.create(null);

globals.add(_do);

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

const prefixes = {
  'new ': (fn, args, _key, _ctx) => new fn(...args),
  'let ': (_fn, args, key, ctx) => {
    ctx._vars ??= Object.create(null);
    const val = args.length === 1 ? args[0] : args;
    return ctx._vars[key] = val;
  },
  'set ': (_fn, args, _key, _ctx) => {
    const [target, prop, val] = args;
    return target[prop] = val;
  },
  'get ': (_fn, args, _key, _ctx) => {
    const [target, ...path] = args;
    return walkProps(target, path);
  },
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
    cmd = commands;
    commands = {};
    commands[cmd] = args;
  }
  if(!isArray(commands)){
    commands = [commands];
  }
  let results = [];
  for(const cmd of commands){
    const [raw, cmdArgs] = Object.entries(cmd)[0];
    const argArr = isArray(cmdArgs) ? cmdArgs : [cmdArgs];
  
    let handler, fnKey;
    for(const prefix in prefixes){
      if(raw.startsWith(prefix)){
        handler = prefixes[prefix];
        fnKey = raw.slice(prefix.length);
        break;
      }
    }
    fnKey ??= raw;
  
    const fnNeeded = !handler || handler === prefixes['new '];
    const fn = fnNeeded ? findProp(fnKey) : undefined;
    handler ??= (fn, args) => fn(...args);
  
    results.push(handler(fn, argArr, fnKey, results));
  }
  return results;
}
