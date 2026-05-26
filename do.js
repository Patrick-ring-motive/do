const globals = new Set();

try{globals.add(global);}catch{}
try{globals.add(globalThis);}catch{}
try{globals.add(self);}catch{}
try{globals.add(window);}catch{}
try{globals.add(this);}catch{}
try{globals.add(document);}catch{}
try{globals.add(Object);}catch{}

