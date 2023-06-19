class AudioWorkletProcessor {
    constructor() {
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
        const input = event.data;
        const inputData = input[0];
        const level = this.calculateRMSLevel(inputData);
        this.port.postMessage({ level });
    }

    calculateRMSLevel(inputData) {
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
        }
        const average = sum / inputData.length;
        return average;
    }
}

registerProcessor('audio-worklet-processor', AudioWorkletProcessor);
