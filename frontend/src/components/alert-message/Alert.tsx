import * as React from 'react';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

    const FlashMessage:React.FunctionComponent<any>= ({message, message2}) => {

    const [open, setOpen] = React.useState(true);
      
    
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
    return;
    }

    setOpen(false);

  }
  if (message)
{
    return (
        <div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                   {message}
                 </Alert>
          </Snackbar>
        
        </div>
    )
  }
  else 
  {    return (
    <div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
             <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {message2}
             </Alert>
    </Snackbar>
    </div>
)

  }

 }; 
 export default FlashMessage;
