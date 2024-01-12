export default class User {
    ws;
    id = null;
    name = null;
    room = null;

    constructor(ws){
        this.ws = ws;
    }

    setId(id){
        this.id = id;
    }

    setName(name){
        this.name = name;
    }

    setRoom(room){
        this.room = room;
    }

    getName(){
        return this.name;
    }

    getRoom(){
        return this.room;
    }

    getSocket(){
        return this.ws;
    }

    toString(){
        return JSON.stringify({
            ws: "ws" + this.id,
            id: this.id,
            name: this.name,
            room: this.room
        })
    }
}