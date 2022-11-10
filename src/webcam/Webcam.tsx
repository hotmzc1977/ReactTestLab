import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Button, Fab, Grid, IconButton, Theme, Typography, useTheme } from '@mui/material';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import { BrowserMultiFormatReader, Result } from '@zxing/library'
import RestartAltIcon from '@mui/icons-material/RestartAlt';




export function Scanner() {

    const [result, setResult] = useState<string>();
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
    const [activeCamera, setActiveCamera] = useState<MediaDeviceInfo>()
    const codeReader = new BrowserMultiFormatReader();

    useEffect(() => {
        listCameras();
    }, [])

    const listCameras = async () => {
        const cameras = (await codeReader.listVideoInputDevices()).filter((c: MediaDeviceInfo) => c.kind === "videoinput");
        setCameras(cameras)
    }

    useEffect(() => {
        if (cameras && cameras.length > 0) {
            setActiveCamera(cameras[cameras.length - 1])
        }
    }, [cameras]);

    useEffect(() => {
        if (activeCamera) {
            decodeOnce(activeCamera.deviceId)
        }
    }, [activeCamera])


    const resetCamera = () => {
        setResult("");
        codeReader.reset();
    }

    const toggleCamera = () => {
        if (cameras.length > 0) {
            if (activeCamera) {
                var i = cameras.findIndex(c => c.deviceId === activeCamera.deviceId) + 1;
                if (i === cameras.length) i = 0
                setActiveCamera(cameras[i])
            }
            else {
                setActiveCamera(cameras[0])
            }
            setResult("");
        }
    }

    const decodeOnce = async (selectedDeviceId: string) => {
        codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result: Result) => {
            console.log(result)
            setResult(result.getText())
            codeReader.stopAsyncDecode();
        }).catch((err: any) => {
            console.error(err)
            setResult(err.toString())
            decodeOnce(selectedDeviceId)
        })

    }


    return (


        <Grid container justifyContent="center" style={{ height: "500px", width: "300px" }}>
            <Grid item xs={12}>
                <video id="video" style={{ height: "400px", width: "300px", border: "1px solid gray" }} />
            </Grid>

            <Grid item xs={6} >
                <IconButton size="large" onClick={() => toggleCamera()} >
                    <FlipCameraIosIcon />
                </IconButton>
            </Grid>

            <Grid item xs={6} >
                <IconButton size="large" onClick={() => resetCamera()} >
                    <RestartAltIcon />
                </IconButton>
            </Grid>

            <Grid item xs={12} >
                <Typography variant="h4" gutterBottom component="div">
                    {result}
                </Typography>
            </Grid>




        </Grid>


    )
}