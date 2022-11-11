import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import PropTypes from 'prop-types';
import Camera, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

interface Props {
    showLogsOnConsole: boolean,
    onTextRecognize?: (text: string) => void,
    isImageMirror: boolean,
    isFullscreen: boolean,
    imageType: "png" | "jpg" | undefined,
    onCameraStart: () => {},
    onCameraStop: () => {},
    onCameraError: () => {}
}

function App(props: Props) {

    const [text, setText] = useState<string>()
    const [status, setStatus] = useState<any>()

    const handleTakePhoto = (dataUri: any) => {
        doOCR(dataUri);
    }

    const worker = createWorker({
        logger: m => { console.log(m); setStatus(`${m.status} -- ${m.progress}`) },
    });

    const doOCR = async (imageData: any) => {
        try {
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(imageData);
            setText(text)
        }
        catch (err: any) {
            setText(err.toString())
        }

        // props.onTextRecognize(text)
    };

    return (
        <div className="App">
            {status && <div>{status}</div>}
            {text && <div>{text}</div>}
            <Camera
                onTakePhoto={(dataUri) => { handleTakePhoto(dataUri); }}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
                isFullscreen={false}
                isImageMirror={false}
                imageType='png'
            // onCameraStart={props.onCameraStart}
            // onCameraStop={props.onCameraStop}
            // onCameraError={props.onCameraError}
            />
        </div>
    );
}

// App.propTypes = {
//   showLogsOnConsole: PropTypes.bool,
//   onTextRecognize: PropTypes.func,
//   isFullscreen: PropTypes.bool,
//   isImageMirror: PropTypes.bool,
//   imageType: PropTypes.string,
//   onCameraStart: PropTypes.func,
//   onCameraStop: PropTypes.func,
//   onCameraError: PropTypes.func,
// }

// App.defaultProps = {
//   showLogsOnConsole: true,
//   onTextRecognize: (text: string) => {console.log('Text: ', text)},
//   isImageMirror: false,
//   isFullscreen: false,
//   imageType: 'png',
//   onCameraStart: () => {},
//   onCameraStop: () => {},
//   onCameraError: () => {},
// }

export default App;