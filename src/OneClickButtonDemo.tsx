import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import React, { FC, MouseEvent, useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel'
import _ from "lodash";
import { useHistory } from 'react-router-dom';

type OCButtonProps = {
  as: React.ComponentType<ButtonProps & IconButtonProps>,
  delay?: number
}

const OneClickButton: FC<ButtonProps & IconButtonProps & OCButtonProps> = ({
  as,
  delay,
  id,
  onClick,
  children,
  ...props
}) => {
  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!isDisabled) {
      // timeout elapsed, nothing to do
      return;
    }

    // isDisabled was changed to true, set back to false after `delay`
    const handle = setTimeout(() => {
      setDisabled(false);
    }, delay ?? 300);
    return () => clearTimeout(handle);
  }, [isDisabled, delay]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }
    //console.log(e)
    setDisabled(true);
    return onClick && onClick(e);
  };
  const Component = as;
  return <Component {...props} id={id} disabled={isDisabled} onClick={handleClick} >
    {children}
  </Component>;
};


export default function OneClickButtonDemo() {
  const [open, setOpen] = React.useState(false);
  const history = useHistory();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    console.log("handleclose OneClickButtonDemo", event, (event.target as any).id)
    setOpen(false);
  };

  const handleCancel = (event: MouseEvent, i: number) => {
    console.log("handlecancel", i, event)
    setOpen(false)
  }

  const debouncedClick = useCallback(_.debounce((id: string) => {
    console.log(id, "debouncedClick")
    setOpen(false)
  }, 300, { leading: true, trailing: false, maxWait: 300 }), []);

  return (
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={() => { console.log(history.location, 1); history.goBack(); console.log(history.location, 2) }}>
        {"<-"}
      </Button>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button>
      <Dialog
        open={open}
        //onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous
            location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <OneClickButton id="disagree" name="disagree" as={Button} delay={300} onClick={handleClose}>Disagree</OneClickButton>
          <Button id="agree" onClick={() => debouncedClick("agree")} autoFocus>
            Agree
          </Button>
          <OneClickButton id="cancel" as={IconButton} style={{ position: "absolute", right: "10px" }} delay={300} onClick={(event: MouseEvent) => handleCancel(event, 123)} autoFocus>
            <CancelIcon />
          </OneClickButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}





