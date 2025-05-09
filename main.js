import './style.css'
import AgoraRTC from 'agora-rtc-sdk-ng';

let rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null
};

let options = {
  appId: '',
  channel: '',
  token: '',
  uid: Math.floor(Math.random() * 1000000)
};

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Agora Video Call - Partner Test</h1>
      
      <form id="joinForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">App ID</label>
          <input type="text" id="appId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Channel Name</label>
          <input type="text" id="channel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Token</label>
          <input type="text" id="token" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" required>
        </div>
        
        <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Join Call
        </button>
      </form>
    </div>
    
    <div id="video-container" class="hidden mt-8">
      <div id="remote-container" class="bg-gray-800 rounded-xl overflow-hidden"></div>
      <div id="local-player"></div>
      
      <button id="leave" class="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
        Leave Call
      </button>
    </div>
  </div>
`;

async function startCall() {
  rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  
  rtc.client.on("user-published", async (user, mediaType) => {
    await rtc.client.subscribe(user, mediaType);
    if (mediaType === "video") {
      const remotePlayerContainer = document.getElementById("remote-container");
      user.videoTrack.play(remotePlayerContainer);
    }
    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });

  await rtc.client.join(options.appId, options.channel, options.token || null, options.uid);
  
  rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
    encoderConfig: {
      width: 720,
      height: 1600,
      frameRate: 30,
      orientationMode: 0 // Portrait mode
    }
  });
  
  await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
  
  const localPlayerContainer = document.getElementById("local-player");
  rtc.localVideoTrack.play(localPlayerContainer);
}

async function leaveCall() {
  rtc.localAudioTrack?.close();
  rtc.localVideoTrack?.close();
  await rtc.client?.leave();
  document.getElementById('video-container').classList.add('hidden');
  document.getElementById('joinForm').classList.remove('hidden');
}

document.getElementById('joinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  options.appId = document.getElementById('appId').value;
  options.channel = document.getElementById('channel').value;
  options.token = document.getElementById('token').value;
  
  try {
    document.getElementById('joinForm').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    await startCall();
  } catch (error) {
    console.error(error);
    alert('Failed to join the call. Please check your credentials and try again.');
    document.getElementById('joinForm').classList.remove('hidden');
    document.getElementById('video-container').classList.add('hidden');
  }
});

document.getElementById('leave').addEventListener('click', leaveCall);