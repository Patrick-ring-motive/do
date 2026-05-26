const globals = new Set();

try{globals.add(global);}catch{}
try{globals.add(globalThis);}catch{}
try{globals.add(self);}catch{}
try{globals.add(window);}catch{}
try{globals.add(this);}catch{}
try{globals.add(document);}catch{}
try{globals.add(Object);}catch{}

const walkProps = (obj,props) =>{
  let res = obj;
  for(const prop of props){
    res = res?.[prop];
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

function $do(commands){
  let res;
  for(const cmd of commands){
    const parts = Object.entries(cmd);
    const fn = findProp(cmd[0]);
    const args = cmd[1];
    res = fn(...args);
  }
  return res;
}
