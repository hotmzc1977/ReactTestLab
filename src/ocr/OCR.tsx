import { useCallback, useEffect, useRef, useState } from "react";
import { Stream } from "stream";
import Cropper from 'react-cropper'
import "cropperjs/dist/cropper.css";
import Webcam from "react-webcam";
import { Box, CircularProgress, Fab, Grid, Icon, IconButton, Switch, TextField, Tooltip, Typography } from "@mui/material";
import Tesseract, { RecognizeResult } from 'tesseract.js';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeselectIcon from '@mui/icons-material/Deselect';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CameraPhoto, { FACING_MODES, IMAGE_TYPES } from 'jslib-html5-camera-photo';

type Position = {
    top: number,
    left: number
}

type Size = {
    width: number,
    height: number
}

type ResultMode = "line" | "word" | "paragraph"
type DisplayMode = "camera" | "crop" | "recognize"

type RecognizeImageResult = { success: boolean, result?: Tesseract.RecognizeResult, error?: any }

type TesseractBlock = Tesseract.Line | Tesseract.Word | Tesseract.Paragraph

interface Props {
    size?: Size
    language?: string,
    cropArea?: Position & Size
    videcropHeightRatio?: number,
    confidence?: number
    resultMode?: ResultMode
    onSelect?: (text: string) => Promise<void>
    onExamineResult?: (result: Tesseract.RecognizeResult) => Promise<boolean>
}

export default function OCR(props: Props) {
    const [OCRSize, setOCRSize] = useState<Size>(props.size ?? { width: window.screen.width * 0.95, height: window.screen.height * 0.75 })
    const [language] = useState(props.language ?? "eng")
    const [upperPanelPosAndSize, setUpperPanelPosAndSize] = useState<Position & Size>()
    const [lowerPanelPosAndSize, setLowerPanelPosAndSize] = useState<Position & Size>()
    const [videcropHeightRatio, setCropHeightPercent] = useState(() => props.videcropHeightRatio ? (props.videcropHeightRatio > 1 ? 1 : props.videcropHeightRatio) : 0.2)
    const [videoOffsetPosAndSize, setVideoOffsetPosAndSize] = useState<Position & Size>()
    const [videoSize, setVideoSize] = useState<Size>()
    const [videoZoom, setVideoZoom] = useState(1)
    const [cropArea, setCropArea] = useState<Position & Size>()
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string>()

    const [cropData, setCropData] = useState<string>();
    const [cropDataPreview, setCropDataPreview] = useState<string>();
    const [cropper, setCropper] = useState<Cropper>();
    const [text, setText] = useState<any>()
    const [result, setResult] = useState<RecognizeImageResult>()
    const [zoomCropData, setZoomCropData] = useState(1)
    const [zoomImageSrc, setZoomImageSrc] = useState(1)
    const [scenario, setScenario] = useState<DisplayMode>("camera")
    const [resultMode, setResultMode] = useState<ResultMode>(props.resultMode ?? "line")
    const [progress, setProgress] = useState(0)
    //const [progressStatus, setProgressStatus] = useState("")
    const [selectedBox, setSelectedBox] = useState("")
    const [confidence] = useState(props.confidence ?? 20)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const [autoMode, setAutoMode] = useState<boolean>(false)

    const processingRef = useRef<boolean>(false)
    const intervalRef = useRef<any>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream>()
    const workerRef = useRef<Tesseract.Worker>()


    useEffect(() => {
        if (videoOffsetPosAndSize && videoSize) {
            const panelHeight = videoOffsetPosAndSize.height * (1 - videcropHeightRatio) / 2
            setUpperPanelPosAndSize({
                top: videoOffsetPosAndSize.top,
                left: videoOffsetPosAndSize.left,
                width: videoOffsetPosAndSize.width,
                height: panelHeight
            })
            setLowerPanelPosAndSize({
                top: videoOffsetPosAndSize.height - panelHeight,
                left: videoOffsetPosAndSize.left,
                width: videoOffsetPosAndSize.width,
                height: panelHeight
            })
            setCropArea({
                top: videoSize.height * (1 - videcropHeightRatio) / 2,
                left: 0,
                width: videoSize.width,
                height: videoSize.height * videcropHeightRatio
            })
        }
    }, [videoOffsetPosAndSize, videoSize, videoZoom, videcropHeightRatio])

    const fileToBase64 = async (file: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const cropImageInSelectedAreaFromVideo = async (cropArea: Position & Size) => {
        if (!previewCanvasRef.current || !videoRef.current) return
        previewCanvasRef.current.height = cropArea.height;
        previewCanvasRef.current.width = cropArea.width
        const ctx = previewCanvasRef.current.getContext('2d');
        const { top, left, height, width } = cropArea;
        //console.log(videoRef.current.videoHeight, videoRef.current.videoWidth, videoRef.current.height, videoRef.current.width)
        if (ctx) {
            // ctx.clearRect(0, 0, videoSize!.width, videoSize!.height);
            // ctx.fillStyle = "rgba(255, 255, 255,1)";
            // ctx.fillRect(0, 0, videoSize!.width, videoSize!.height);
            ctx!.drawImage(
                videoRef.current,
                left,
                top,
                width,
                height,
                0,
                0,
                width,
                height
            );
            let newimgUri = previewCanvasRef.current.toDataURL().toString();
            return newimgUri;
        }
    }

    const updateImageSrc = async (image: string, copyToCropDate?: boolean) => {
        const imgSize = await getImageSize(image);
        const zoom = calculateZoom(imgSize, OCRSize);
        setImageSrc(image);
        setZoomImageSrc(zoom)
        if (copyToCropDate) {
            setCropData(image);
            setZoomCropData(zoom)
            setResult(await processImage(image))
        }
    }

    const updateCropData = async (imageUrl: string, updateOnly?: boolean) => {
        const imgSize = await getImageSize(imageUrl)
        const zoom = calculateZoom(imgSize, OCRSize)
        setCropData(imageUrl);
        //setCropDataSize(imgSize)
        setZoomCropData(zoom)
        !updateOnly && setResult(await processImage(imageUrl))
    }

    const getImageSize = async (imgBase64: string): Promise<Size> => {
        let img = new Image()
        img.src = imgBase64
        await img.decode()
        return { width: img.naturalWidth, height: img.naturalHeight }
    }

    const calculateZoom = (imageSize: Size, canvasSize: Size) => {
        if (canvasSize.height >= imageSize.height && canvasSize.width >= imageSize.width) {
            return 1
        }
        else {
            const xScale = canvasSize.width / imageSize.width
            const yScale = canvasSize.height / imageSize.height
            return xScale > yScale ? yScale : xScale
        }
    }

    const onInputChange = async () => {
        const files = inputRef.current?.files;
        if (files && files.length > 0) {
            //const imageUrl = URL.createObjectURL(files[0])
            setScenario("recognize")
            const imageBase64 = await fileToBase64(files[0])
            await updateImageSrc(imageBase64 as string, true)

        }
        else {
            setImageSrc(undefined);
        }
    }

    const onOCRClicked = async () => {
        if (autoMode) return;
        if (scenario === "camera") {
            const fullImage = await cropImageInSelectedAreaFromVideo({ ...videoSize!, top: 0, left: 0 })
            fullImage && updateImageSrc(fullImage)
            const cropImage = await cropImageInSelectedAreaFromVideo(cropArea!)
            cropImage && updateCropData(cropImage)
            setResult(undefined)
            setScenario("recognize")
        }

        else if (scenario === "crop" && cropper) {
            cropper.getCroppedCanvas().toBlob(async (blob) => {
                if (blob) {
                    const image = await fileToBase64(blob)
                    updateCropData(image as string);
                    setScenario("recognize")
                }
            })
        }
        else {
            cropData && setResult(await processImage(cropData))
        }
    }

    const processImage = async (image: string): Promise<RecognizeImageResult> => {
        return workerRef.current!.recognize(image)
            .then(result => {
                console.log("result", result);
                setProgress(1);
                return { success: true, result };
            })
            .catch(err => {
                console.error("recognize", err);
                return { success: false, error: err };
            });

    }

    const zoomIn = () => {
        if (scenario === "recognize") {
            setZoomCropData(zoom => zoom + 0.1)
        }
        else if (scenario === "crop") {
            setZoomImageSrc(zoom => zoom + 0.1)
        }
    }

    const zoomOut = () => {
        if (scenario === "recognize") {
            setZoomCropData(zoom => zoom - 0.1)
        }
        else if (scenario === "crop") {
            setZoomImageSrc(zoom => zoom - 0.1)
        }
    }

    const onDeleteClicked = () => {
        setScenario("camera")
        setImageSrc(undefined)
        setCropData(undefined)
        setResult(undefined)
    }

    const onStyleChanged = () => {
        if (resultMode === "line") {
            setResultMode("paragraph")
        }
        else if (resultMode === "paragraph") {
            setResultMode("word")
        }
        else {
            setResultMode("line")
        }
    }

    const drawBBox = (blocks: (Tesseract.Line | Tesseract.Word | Tesseract.Paragraph)[]) => {

        return blocks.map((item, index) => {
            const key = `${resultMode}-${index}`

            return item.confidence > confidence ? <div key={key} id={key}
                onClick={async () => {
                    if (key === selectedBox) {
                        setSelectedBox('');
                        setText('')
                        props.onSelect && await props.onSelect('')
                    }
                    else {
                        setSelectedBox(key);
                        setText(item.text)
                        props.onSelect && await props.onSelect(item.text)
                    }
                }}
                style={{
                    position: "absolute",
                    left: item.bbox.x0 * (autoMode ? videoZoom : zoomCropData),
                    top: autoMode ? (item.bbox.y0 + ((videoSize?.height ?? 0) - (cropArea?.height ?? 0)) / 2) * videoZoom : item.bbox.y0 * zoomCropData,
                    width: (item.bbox.x1 - item.bbox.x0) * (autoMode ? videoZoom : zoomCropData),
                    height: (item.bbox.y1 - item.bbox.y0) * (autoMode ? videoZoom : zoomCropData),
                    border: selectedBox === key ? "1px solid green" : "1px dashed red",
                    backgroundColor: "transparent",
                    color: "red",
                    overflow: "visible"
                }}><div style={{ position: "relative", overflow: "visible", height: "100%" }}>
                    <div style={{ position: "absolute", width: "80%", bottom: "100%", color: "#fb4d3d", overflow: "hidden", fontSize: "10px", display: "block", whiteSpace: "nowrap" }}>
                        {item.text}
                    </div>
                </div>
            </div> : null

        })
    }

    const onFileUploadClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
            inputRef.current.files = null
        }
    }



    useEffect(() => {
        if (autoMode && !intervalRef.current) {
            intervalRef.current = setInterval(async () => {
                if (!processingRef.current) {
                    processingRef.current = true
                    const image = await cropImageInSelectedAreaFromVideo(cropArea!)
                    if (image) {
                        setCropDataPreview(image)
                        const result = await processImage(image as any)
                        setResult(result)
                        if (props.onExamineResult && result.result && await props.onExamineResult(result.result)) {
                            await updateCropData(image, true)
                            setScenario("recognize")
                            setAutoMode(false)
                            return;
                        }
                    }
                    setTimeout(() => {
                        processingRef.current = false
                    }, 100);
                }
            }, 100)
            console.log("intervalRef.current.set", intervalRef.current)
        }
        else {
            console.log("intervalRef.current.clear", intervalRef.current)
            processingRef.current = false
            intervalRef.current && clearInterval(intervalRef.current)
            intervalRef.current = null;
        }
    }, [autoMode])

    const playVideo = () => {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "environment"

            }
        }).then((stream: MediaStream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // videoRef.current.onloadedmetadata = () => {
                //     setVideoSize({
                //         width: videoRef.current!.videoWidth,
                //         height: videoRef.current!.videoHeight
                //     })
                //     setVideoOffsetPosAndSize({
                //         top: videoRef.current!.offsetTop,
                //         left: videoRef.current!.offsetLeft,
                //         width: videoRef.current!.offsetWidth,
                //         height: videoRef.current!.offsetHeight
                //     })
                //     setVideoZoom(videoRef.current!.offsetHeight / videoRef.current!.videoHeight)
                // }
                streamRef.current = stream
                videoRef.current.play().then(() => {
                    setVideoSize({
                        width: videoRef.current!.videoWidth,
                        height: videoRef.current!.videoHeight
                    })
                    setVideoOffsetPosAndSize({
                        top: videoRef.current!.offsetTop,
                        left: videoRef.current!.offsetLeft,
                        width: videoRef.current!.offsetWidth,
                        height: videoRef.current!.offsetHeight
                    })
                    setVideoZoom(videoRef.current!.offsetHeight / videoRef.current!.videoHeight)
                    setOCRSize({ ...OCRSize, height: videoRef.current!.offsetHeight + 100 })
                })
                    .catch((err) => {
                        console.log("video play error: " + err.toString())
                    });
            }
        })
    }

    const stopVideo = () => {
        streamRef && streamRef.current && streamRef.current.getTracks().forEach((track: any) => {
            track.stop();
        })
        console.log("video stop")
    }

    useEffect(() => {
        console.log("videoSize", videoSize, videoRef.current?.offsetHeight, videoRef.current?.offsetWidth, videoRef.current?.offsetTop, videoRef.current?.offsetLeft, videoRef.current?.offsetParent)
        console.log("cropArea", cropArea)
    }, [videoSize])

    const initialize = async () => {

        workerRef.current = Tesseract.createWorker({
            logger: m => {
                console.log(m);
                //setProcessStatus(m);
                //setProgressStatus(m.status);
                if (m.status === "recognizing text") {
                    setProgress(m.progress < 0.02 ? 0.02 : m.progress);
                }
                else {
                    setProgress(0.01);
                }
            },
        });
        await workerRef.current.load();
        await workerRef.current.loadLanguage(language);
        await workerRef.current.initialize(language);
        playVideo()
        setScenario("camera")

    }

    const terminate = async () => {
        workerRef.current && await workerRef.current.terminate()

    }

    useEffect(() => {
        initialize()
        return () => {
            stopVideo();
            terminate();
        }
    }, [])

    useEffect(() => {
        if (scenario === "camera") {
            playVideo()
        }
        else {
            stopVideo()
        }
    }, [scenario])

    return (
        <Box style={{ height: OCRSize.height, width: OCRSize.width, position: "relative", border: "1px solid Black", backgroundColor: "gray", opacity: "0.9" }}>
            <Box style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} >
                <Box style={{ position: "relative", overflow: "visible" }}>
                    {/* {
                        scenario === "camera" && <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={OCRSize.width}
                            height={OCRSize.height}
                            videoConstraints={{
                                // deviceId: cameraDeviceId,
                                facingMode: "environment",
                                height: OCRSize.height,
                                width: OCRSize.width,
                            }}

                        />
                    } */}


                    {scenario === "camera" && <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            maxWidth: OCRSize.width
                        }}
                    // style={{ position: "absolute", top: 0, left: 0 }}
                    ></video>}

                    {/* {scenario === "camera" && <img
                        style={{ zoom: zoomCropData }}
                        src={cropData}
                    />} */}


                    {scenario === "camera" && upperPanelPosAndSize &&
                        <Box style={{ ...upperPanelPosAndSize, position: "absolute", opacity: "0.9", background: "gray" }} >
                            {cropDataPreview && autoMode && <img src={cropDataPreview} style={{ maxWidth: "100%", maxHeight: "100%" }} />}
                        </Box>
                    }
                    {scenario === "camera" && lowerPanelPosAndSize && <Box style={{ ...lowerPanelPosAndSize, position: "absolute", opacity: "0.8", background: "gray" }} />}

                    {scenario === "crop" && <Cropper
                        height={OCRSize.height}
                        width={OCRSize.width}
                        zoomTo={zoomImageSrc}
                        // preview=".img-preview"
                        src={imageSrc}
                        viewMode={1}
                        minCropBoxHeight={10}
                        minCropBoxWidth={10}
                        background={false}
                        responsive={true}
                        // autoCropArea={1}
                        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                        onInitialized={(instance) => {
                            setCropper(instance);
                        }}
                        guides={true}
                        style={{
                            maxHeight: OCRSize.height,
                            maxWidth: OCRSize.width
                        }}
                    />}


                    {
                        scenario === "recognize" && cropData &&
                        <img style={{ zoom: zoomCropData }} src={cropData} alt="cropped" />
                    }
                    <canvas ref={previewCanvasRef} hidden />

                    {result && result.result && ((autoMode === false && progress === 1) || autoMode === true) &&
                        drawBBox(resultMode === "paragraph" ? result.result.data.paragraphs : (resultMode === "word" ? result.result.data.words : result.result.data.lines))
                    }

                    {/* {autoMode === true && result && result.result &&
                        drawBBox(resultMode === "paragraph" ? result.result.data.paragraphs : (resultMode === "word" ? result.result.data.words : result.result.data.lines))
                    } */}


                </Box>
            </Box>
            {
                autoMode === false && scenario === "recognize" && progress > 0 && progress < 1 &&
                <Box sx={{
                    top: lowerPanelPosAndSize?.top ?? 0,
                    left: 0,
                    bottom: (lowerPanelPosAndSize?.height ?? 0) + (lowerPanelPosAndSize?.top ?? 0),
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress size={25} variant="determinate" value={100 * progress} />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="caption"
                                component="div"
                                color="text.secondary"
                                fontSize="20px"
                                sx={{ width: OCRSize.width }}
                            >{`${Math.round(100 * progress)}%`}</Typography>

                        </Box>
                    </Box>
                </Box>

            }
            <Fab aria-label="Auto Mode" onClick={() => setAutoMode(autoMode => !autoMode)} size="small" style={{
                position: 'absolute',
                bottom: 5,
                left: 5
            }}>
                <HdrAutoIcon color={autoMode ? undefined : "disabled"} />
            </Fab>
            {/* {
                scenario === "camera" && <Fab color="default" aria-label="add" size="small" style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 5
                }} onClick={onCameraClicked}>
                    <CenterFocusStrongIcon />
                </Fab>
            } */}
            {
                <Fab aria-label="add" size="small" style={{
                    position: 'absolute',
                    bottom: 50,
                    left: 5
                }} onClick={onStyleChanged}>
                    <LineStyleIcon />
                </Fab>
            }

            {scenario !== "camera" && <Fab aria-label="add" size="small" style={{
                position: 'absolute',
                bottom: 50,
                right: 5
            }} onClick={onDeleteClicked}>
                <DeleteForeverIcon />
            </Fab>}

            <Fab aria-label="upload" size="small" style={{
                position: 'absolute',
                bottom: 5,
                right: 5
            }} onClick={onFileUploadClick} >
                <FileUploadIcon />
            </Fab>

            {scenario === "recognize" && <Fab onClick={() => { setScenario("crop"); setResult(undefined) }} size="small" style={{
                position: 'absolute',
                bottom: 95,
                right: 5
            }}>
                <DeselectIcon />
            </Fab>}

            <Fab aria-label="Take Photo" size="large" onClick={onOCRClicked} style={{
                position: 'absolute',
                bottom: 5,
                left: OCRSize.width / 2 - 28
            }}>
                <PhotoCameraIcon fontSize="large" />
            </Fab>

            {scenario === "recognize" && <IconButton aria-label="Zoom In" onClick={zoomIn} size="large" style={{
                position: 'absolute',
                bottom: 0,
                right: OCRSize.width / 2 - 100,
            }} >
                <ZoomInIcon fontSize="large" />
            </IconButton>}
            {scenario === "recognize" && <IconButton aria-label="Zoom Out" onClick={zoomOut} size="large" style={{
                position: 'absolute',
                bottom: 0,
                left: OCRSize.width / 2 - 100,
            }}>
                <ZoomOutIcon fontSize="large" />
            </IconButton>}

            {/* <Fab aria-label="Crop" onClick={() => setScenario("crop")} size="small" style={{
                position: 'absolute',
                bottom: 120,
                left: 5
            }}>
                { <HighlightAltIcon />}
            </Fab> */}




            <input
                accept="images/*, image/*"
                ref={inputRef} type="file"
                onChange={onInputChange}
                onClick={(event) => { (event.target as HTMLInputElement).value = '' }}
                hidden />


        </Box>
    );
}
