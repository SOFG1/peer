const socket = io("192.168.100.101:3000");

const testBtn = document.querySelector(".test-socket");
socket.on("test", (d) => alert("test"));
const testPeerBtn = document.querySelector(".test-peer");

testBtn.addEventListener("click", () => {
  socket.emit("test", "test");
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//peers

let peers = {}; //use these if host device

testPeerBtn.addEventListener("click", () => {
  const list = Object.values(peers);
  list.forEach((p) => p.send("data"));
});

socket.on("connection-started", (d) => {
  console.log(d);
  if (d.indexOf(socket.id) === 0) {
    createInitiatorPeers(d.slice(1));
  }
  if (d.indexOf(socket.id) !== 0) {
    createSinglePeer(socket.id);
  }
});

function createSinglePeer(socketId) {
  const p = new SimplePeer({ initiator: false, trickle: false });
  peers = {
    [socketId]: p,
  };
  p.on("signal", (data) => {
    console.log({ id: socketId, data });
    socket.emit("signal", { id: socketId, data });
  });
  p.on("data", receiveData);
  p.on("connect", () => {
    console.log("Peer connected!");
  });
}

function createInitiatorPeers(ids) {
  const list = {};
  ids.forEach((id) => {
    const p = new SimplePeer({ initiator: true, trickle: false });
    list[id] = p;
    p.on("signal", (data) => {
      console.log({ id, data });
      socket.emit("signal", { id, data });
    });
    p.on("data", receiveData);
    p.on("connect", () => {
      console.log("Peer connected!");
    });
  });
  peers = list;
}

function receiveData(d) {
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(d);
  console.log(jsonString);
  alert(jsonString)
}

socket.on("signal", ({ id, data }) => {
  console.log({ id, data });
  peers[id]?.signal(data);
});