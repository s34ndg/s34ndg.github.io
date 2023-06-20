// Create a new SilenceDetector class for your silence detection
class SilenceDetector extends AudioWorkletProcessor {
    constructor() {
        super();
        this.threshold = -30; // default threshold value
        this.silenceDuration = 3; // default silence duration in seconds
        this.currentAudioLevel = 0;
        this.silenceTimer = null;
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
        const { data } = event;
        if (data.threshold !== undefined) {
            this.threshold = data.threshold;
        }
        if (data.silenceDuration !== undefined) {
            this.silenceDuration = data.silenceDuration;
        }
    }

    process(inputs, outputs) {
        const input = inputs[0];
        let sumSquared = 0;

        // Calculate the sum of squared values for all channels
        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            for (let i = 0; i < inputChannel.length; ++i) {
                sumSquared += inputChannel[i] * inputChannel[i];
            }
        }

        // Calculate the average power level
        const rms = Math.sqrt(sumSquared / input[0].length);

        // Convert the average power level to decibels (dB)
        const dB = 20 * Math.log10(rms);

        this.currentAudioLevel = dB;

        // Check if the current audio level is below the threshold
        if (dB < this.threshold) {
            // If silence timer is not running, start it
            if (!this.silenceTimer) {
                this.silenceTimer = setTimeout(() => {
                    this.port.postMessage('silence-detected');
                }, this.silenceDuration * 1000);
            }
        } else {
            // If audio level is above the threshold, clear the silence timer
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }

        return true;
    }
}

// Register the audio worklet processor
registerProcessor('silence-detector', SilenceDetector);
