// Global variables
let silenceThreshold = 50; // Default silence threshold in decibels
let silenceDuration = 5; // Default silence duration in seconds
let audioContext;
let audioStream;
let isListening = false;

// Check for browser support
if (!('webkitAudioContext' in window)) {
  alert('Web Audio API is not supported in this browser.');
}

// Function to start listening for silence
function startListening() {
  isListening = true;

  // Request permission to access the microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioStream = audioContext.createMediaStreamSource(stream);

      // Create a script processor node to analyze audio
      const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = analyzeAudio;

      // Connect audio stream to the script processor node
      audioStream.connect(scriptNode);
      scriptNode.connect(audioContext.destination);
    })
    .catch(function (error) {
      console.error('Error accessing the microphone:', error);
    });
}

// Function to stop listening for silence
function stopListening() {
  isListening = false;

  // Disconnect audio stream
  if (audioStream) {
    audioStream.disconnect();
  }

  // Close the audio context
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
}

// Function to analyze audio and detect silence
function analyzeAudio(event) {
  const inputData = event.inputBuffer.getChannelData(0);
  const bufferLength = inputData.length;
  let total = 0;

  for (let i = 0; i < bufferLength; i++) {
    const sample = inputData[i];
    total += sample * sample;
  }

  // Calculate the root mean square (RMS) of the audio samples
  const rms = Math.sqrt(total / bufferLength);

  // Convert RMS to decibels
  const decibels = 20 * Math.log10(rms);

  // Check if the environment is silent
  if (decibels < silenceThreshold) {
    handleSilence();
  } else {
    handleSound();
  }
}

// Function to handle silence
function handleSilence() {
  // Timer for detecting silence duration
  let timer = setTimeout(function () {
    if (isListening) {
      notifyUser();
    }
  }, silenceDuration * 1000);

  // Function to cancel the silence detection timer
  function cancelTimer() {
    clearTimeout(timer);
  }

  // Event listener for the "stop" button
  document.getElementById('stopButton').addEventListener('click', function () {
    stopListening();
    cancelTimer();
  });
}

// Function to handle sound
function handleSound() {
  // Remove any existing notifications
  if (window.Notification && window.Notification.permission === 'granted') {
    window.Notification.close();
  }
}

// Function to notify the user
function notifyUser() {
  // Check if browser supports notifications
  if (!window.Notification) {
    console.warn('Notifications API is not supported in this browser.');
    return;
  }

  // Request permission to display notifications
  if (window.Notification.permission !== 'granted') {
    window.Notification.requestPermission();
    return;
  }

  // Display the notification
  const notification = new window.Notification('Speak Louder', {
    body: 'Your voice is not reaching the threshold. Please speak louder.',
    icon: 'notification-icon.png' // Replace with your own icon path
  });

  // Event listener for closing the notification
  notification.addEventListener('close', function () {
    stopListening();
  });
}

// Event listener for the "start" button
document.getElementById('startButton').addEventListener('click', function () {
  startListening();
});
