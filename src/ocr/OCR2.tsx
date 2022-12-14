import React, { useState, Fragment } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';

function App() {

    const [playing, setPlaying] = useState(false)
    const [imgPath, setImgPath] = useState('')
    const [isCropping, setIsCropping] = useState(false)
    const [newImgPathBase64, setNewImgPathBase64] = useState('')
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 300, height: 400, unit: "px" });

    const HEIGHT = 400;
    const WIDTH = HEIGHT / 4 * 3;



    const startVideo = () => {
        setIsCropping(false)
        setImgPath('')
        setPlaying(true)
        navigator.mediaDevices.getUserMedia(
            {
                video: true,
            })
            .then(
                (stream) => {
                    let video = document.getElementsByClassName('app__videoFeed')[0];
                    if (video) {
                        (video as any).srcObject = stream;
                    }
                }
            )
            .catch(reason => console.log(reason))
    }


    const stopVideo = () => {
        setPlaying(false)
        let video = document.getElementsByClassName('app__videoFeed')[0];
        (video as any).srcObject.getTracks()[0].stop();
    }

    const captureVideo = () => {
        const canvas = document.createElement("CANVAS") as any;
        var video = document.getElementsByClassName('app__videoFeed')[0] as any;
        canvas.height = (video as any).videoHeight;
        canvas.width = (video as any).videoHeight / 4 * 3;
        canvas.getContext('2d').drawImage(video, (video.videoWidth - (video.videoHeight / 4 * 3)) / 2, 0, video.videoHeight / 4 * 3, video.videoHeight, 0, 0, video.videoHeight / 4 * 3, video.videoHeight);
        canvas.toBlob((blob: any) => {
            stopVideo()
            setImgPath(URL.createObjectURL(blob))
        }, 'image/jpeg', 0.95);
    }

    const onCropChange = (crop: any) => {
        const canvas = document.createElement('canvas')
        const image = document.createElement('img')
        image.src = imgPath
        const pixelRatio = window.devicePixelRatio
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        setNewImgPathBase64(canvas.toDataURL("image/jpeg"))
    }

    return (
        <div className='container-fluid'>
            <div className='row mt-4'>
                {
                    imgPath &&
                    <div className='col-12 text-center'>
                        <img src={imgPath} height={HEIGHT} />
                    </div>
                    ||
                    <div className='col-12 text-center'>
                        {playing && <div style={{
                            border: '2px dotted red',
                            position: 'absolute',
                            height: HEIGHT,
                            width: WIDTH,
                            left: 0,
                            right: 0,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}>
                        </div>}

                        <video
                            style={{ border: '1px solid white' }}
                            height={HEIGHT}
                            muted
                            autoPlay
                            className='app__videoFeed'
                        />
                    </div>}
            </div>
            <div className='row'>
                <div className='col-12 text-center mt-4'>
                    {
                        !playing &&
                        <button className='btn btn-primary' onClick={startVideo}>Start</button>
                        ||
                        <button className='btn btn-success' onClick={captureVideo}>Capture</button>
                    }
                    {
                        !playing && !!imgPath &&
                        <button className='btn btn-warning ml-2' onClick={() => setIsCropping(true)}>Crop</button>
                    }
                </div>
            </div>
            {isCropping &&
                <div className='row'>
                    <div className='col-12 text-center'>
                        <hr />
                        <h4 className='display-4'>Crop your image below!</h4>
                        <hr />
                    </div>
                    <div className='col-5 text-center'>
                        <ReactCrop
                            crop={crop}
                            ruleOfThirds
                            onComplete={onCropChange}
                            onChange={(newCrop: any) => setCrop(newCrop)}
                        >
                            <img src={imgPath} />
                        </ReactCrop>
                    </div>
                    <div className='col-2 text-center' style={{ paddingTop: '100px' }}>
                        <i className="bi bi-arrow-right-square" style={{ fontSize: '4rem', }}></i>
                    </div>
                    <div className='col-5 text-center'>
                        <div>
                            <img src={newImgPathBase64} />
                        </div>
                        <div>
                            <a className="btn btn-info mt-2" download="Image.png" href={newImgPathBase64} role="button">Download</a>
                        </div>
                    </div>

                </div>}
        </div>
    );
}

export default App;