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
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Agora Video Call</h1>
      
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
          <label class="block text-sm font-medium text-gray-700">Token (optional)</label>
          <input type="text" id="token" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
        </div>
        
        <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Join Call
        </button>
      </form>
    </div>
    
    <div id="video-container" class="hidden mt-8">
      <div id="remote-container" class="bg-gray-800 rounded-xl overflow-hidden"></div>
      <div id="local-player"></div>
      
      <div class="mt-4 flex justify-center space-x-4">
        <button id="toggleAudio" class="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Mute Audio
        </button>
        <button id="toggleVideo" class="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Disable Video
        </button>
        <button id="leave" class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          Leave Call
        </button>
      </div>
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
      height: 1280,
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

// Add toggle controls for audio and video
let isAudioMuted = false;
document.getElementById('toggleAudio').addEventListener('click', async () => {
  if (rtc.localAudioTrack) {
    if (isAudioMuted) {
      await rtc.localAudioTrack.setEnabled(true);
      document.getElementById('toggleAudio').textContent = 'Mute Audio';
      document.getElementById('toggleAudio').classList.remove('bg-gray-600');
      document.getElementById('toggleAudio').classList.add('bg-indigo-600');
    } else {
      await rtc.localAudioTrack.setEnabled(false);
      document.getElementById('toggleAudio').textContent = 'Unmute Audio';
      document.getElementById('toggleAudio').classList.remove('bg-indigo-600');
      document.getElementById('toggleAudio').classList.add('bg-gray-600');
    }
    isAudioMuted = !isAudioMuted;
  }
});

let isVideoDisabled = false;
document.getElementById('toggleVideo').addEventListener('click', async () => {
  if (rtc.localVideoTrack) {
    if (isVideoDisabled) {
      await rtc.localVideoTrack.setEnabled(true);
      document.getElementById('toggleVideo').textContent = 'Disable Video';
      document.getElementById('toggleVideo').classList.remove('bg-gray-600');
      document.getElementById('toggleVideo').classList.add('bg-indigo-600');
    } else {
      await rtc.localVideoTrack.setEnabled(false);
      document.getElementById('toggleVideo').textContent = 'Enable Video';
      document.getElementById('toggleVideo').classList.remove('bg-indigo-600');
      document.getElementById('toggleVideo').classList.add('bg-gray-600');
    }
    isVideoDisabled = !isVideoDisabled;
  }
});