import EventEmitter from "events";

const Emitter = new EventEmitter();

//Emitter.on must be above the Emitter.emit
Emitter.on("Hello", () => console.log("Heard you boss"));
Emitter.emit("Hello");
