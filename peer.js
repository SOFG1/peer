//const socket = io("192.168.100.101:3000");
const socket = io("https://server-qoi0.onrender.com");
let currentKey = ""

const testBtn = document.querySelector(".test-socket");
socket.on("test", (d) => alert("test"));
const testPeerBtn = document.querySelector(".test-peer");

testBtn.addEventListener("click", () => {
  socket.emit("test", "test");
});

function setLoading(isLoading) {
  if (isLoading) {
    document.querySelector(".test-peer").classList.add("hidden");
    document.querySelector(".loading").classList.remove("hidden");
  }
  if (!isLoading) {
    document.querySelector(".test-peer").classList.remove("hidden");
    document.querySelector(".loading").classList.add("hidden");
  }
}

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
  peers = {};
  setLoading(true);
  currentKey = d.join("")
  const isHost = d.indexOf(socket.id) === 0
  if (isHost) {
    createInitiatorPeers(d.slice(1));
  }
  if (!isHost) {
    createSinglePeer(socket.id);
  }
});

function createSinglePeer(socketId) {
  const p = new SimplePeer({ initiator: false, trickle: false });
  peers = {
    [socketId]: p,
  };
  p.on("signal", (data) => {
    socket.emit("signal", { id: socketId, data, currentKey });
  });
  p.on("data", receiveData);
  p.on("connect", () => {
    console.log("Peer connected!");
    setLoading(false);
  });
}

function createInitiatorPeers(ids) {
  const list = {};
  ids.forEach((id) => {
    const p = new SimplePeer({ initiator: true, trickle: false });
    list[id] = p;
    p.on("signal", (data) => {
      console.log({ id, data });
      socket.emit("signal", { id, data, currentKey });
    });
    p.on("data", receiveData);
    p.on("connect", () => {
      console.log("Peer connected!");
      setLoading(false);
    });
  });
  peers = list;
}

function receiveData(d) {
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(d);
  console.log(jsonString);
  alert(jsonString);
}

socket.on("signal", ({ id, data, currentKey: key }) => {
  if(currentKey !== key) return
  peers[id]?.signal(data);
});
