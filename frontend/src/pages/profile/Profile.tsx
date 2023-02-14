import Navbar from '../../components/nav/Nav';
import * as React from 'react';
import "./profil.scss"

import Stack from '@mui/material/Stack';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../state';
import { useEffect, useState } from 'react';
import PinInput from 'react-pin-input';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import Cookies from 'universal-cookie';
import FlashMessage from '../../components/alert-message/Alert'


const cookies = new Cookies();

const Profile = () => {

    const [firstOpen, setFirstOpen] = useState(true)
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector((state: RootState) => state.persistantReducer.userReducer);
    const [inputValue, setInputValue] = useState("")
    const [open, setOpen] = React.useState(false);
    //2FA
    const [open2FA, setOpen2FA] = React.useState(false);
    const [open2FA2, setOpen2FA2] = React.useState(false);
    const [qrCode2FA, setQrCode2FA] = useState("");
    // const [code2FA, setCode2FA] = useState("");
    // const [res2FA, setRes2FA] = useState(0);
    // const [codePin, setCodePin] = useState(0);
    const dispatch = useDispatch();
    const { setUser } = bindActionCreators(actionCreators, dispatch);


    const [userMatchHistory, setUserMatchHistory] = useState(
        Array<{
            id: string,
            player1: string,
            score1: number,
            player2: string,
            score2: number,
            winner: string,
        }>()
    );

    const [userDisplay, setUserDisplay] = useState({
        id: "",
        username: '', //pseudo
        login: '', // prenom  to --> login 
        profileImage: '', // oui
        email: '',
        Rank: 0, // la XP de notre joueur 
        WinNumber: 0, // nbr de gagne
        LossNumber: 0,// nbr de perdu
        twoFactorAuth: false,
        getData: false,
    });
    const handleClickOpen = () => {
        setOpen(true);
    };
    const [succes, setsucces] = useState(false);
    const [error, seterror] = useState(false);
    const [message, setmessage] = useState("");
    const [message2, setmessage2] = useState("");

    const handleClose = (change: boolean) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        const tmp = inputValue.replace(/ /g, "")
        if (change && tmp !== "") {
            // string.replace(/ /g, "")
            //   user.suer?.id /blocked/, {username : },  option 
            axios.patch(`http://${utils.ip}:5001/user/${user.user?.id}/username`, { username: tmp }, options).then(response => {
                if (response.data != null) {
                    setUser(response.data)
                    setmessage("change name on " + tmp);
                    setUserMatchHistory([])
                    setFirstOpen(true);
                    setsucces(true);
                }
            }).catch(err => {
                if (err.response!.status === 500) {
                    setmessage2("username deja existant");
                    seterror(true);
                }
            })
            setInputValue("")
            setsucces(false);
            seterror(false);
            // getUserData();
        };
        setOpen(false);
    }
    //2FA

    const handleClickOpen2FA2 = () => {
        setOpen2FA2(true);
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
    };

    const handleClose2FA2 = () => {
        setOpen2FA2(false);
        setQrCode2FA("")
        // setCode2FA("")
        // setRes2FA(0)
    };

    const handleClickOpen2FA = () => {
        setOpen2FA(true);
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
            axios.get(`http://${utils.ip}:5001/user/${user.user?.id}/2fa/generate`, options).then(res => (setQrCode2FA(res.data)))
    };

    const handleClose2FA = () => {
        setOpen2FA(false);
        setQrCode2FA("")
        // setCode2FA("")
        // setRes2FA(0)
    };

    const send2FARequest = (value: string) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://${utils.ip}:5001/user/${user.user?.id}/2fa/activate/` + value, options)
            .then(res => {
                setUser(res.data);
                setOpen2FA(false);
                setsucces(true)
                setmessage("Two factor authentification activate")
            })
            .catch(err => {
                seterror(true)
                setmessage2("Wrong code")
            });
        setsucces(false)
        seterror(false)
    }
    const send2FARequestDeactivate = (value: string) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://${utils.ip}:5001/user/${user.user?.id}/2fa/deactivate/` + value, options)
            .then(res => {
                setUser(res.data);
                setsucces(true)
                setmessage("Two factor authentification deactivated")
                setOpen2FA2(false);
            })
            .catch(err => {
                seterror(true)
                setmessage2("Wrong code")
            });
        setsucces(false)
        seterror(false)
    }
    const getUserData = () => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://${utils.ip}:5001/user/id/${user.user?.id}`, options).then(response => {
            if (response.data != null) {
                setUserDisplay({
                    id: response.data.id,
                    username: response.data.username,
                    login: response.data.login,
                    profileImage: response.data.profileImage,
                    email: response.data.email,
                    WinNumber: response.data.WinNumber,
                    LossNumber: response.data.LossNumber,
                    Rank: response.data.Rank,
                    twoFactorAuth: response.data.twoFactorAuth,
                    getData: true,
                })
            }
        }).catch(() => { })
        axios.get(`http://${utils.ip}:5001/game/${user.user?.id}`, options).then(response => {
            if (response.data != null) {
                userMatchHistory.splice(0, userMatchHistory.length)
                response.data.forEach((data: any) => {
                    const obj = {
                        id: data.game.id,
                        player1: data.game.player1.username,
                        score1: data.game.score_u1,
                        player2: data.game.player2.username,
                        score2: data.game.score_u2,
                        winner: data.game.winner.username,
                    }
                    userMatchHistory.push(obj)
                })
                setFirstOpen(false);
            }
        }).catch(error => {
            console.log(error);
        });
    }

    useEffect(() => {
        if (firstOpen)
            getUserData();
    })

    //----------------image pour téléchager--------------------------------------------

    const convertFile = (e: any) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        }
        const img = e.target.files.item(0);
        var formData = new FormData();
        formData.append("photo", img);

        var config = {
            method: 'POST',
            url: `http://${utils.ip}:5001/user/${user.user?.id}/profileImage`,
            headers: options.headers,
            profileImage: formData,
            data: formData,
            withCredentials: true
        }
        axios(config).then((res) => {
            setUser(res.data);
            setmessage("Picture upload with success")
            setsucces(true)
        }).catch((err) => {
            setmessage2("Picture too big")
            seterror(true)
        })
        setsucces(false)
        seterror(false)
    }
    //----------------------------------------------------------------------------------------------------------------
    return (
        <React.Fragment >
            <Navbar />
            <div className="profilePageContainer">
                <div className="profile" >
                    <Stack direction="row" spacing={2} className="avatarItem">
                        <img alt="Cerise" src={user.user?.profileImage} className="avatar" />
                    </Stack>
                    <Button component="label" className="avatarChange">
                        Change Profile Picture
                        <input id='file-upload' hidden type='file' accept='.jpeg, .jpg, .png' onChange={convertFile} />
                    </Button>
                    <div className="infoUsername">
                        <h3 className="userNameChange">
                            Username :
                        </h3>
                        <Typography className="userNamePrintChange">
                            {userDisplay?.username}
                        </Typography>
                    </div>
                    <Button className="buttonChange" type="submit" onClick={handleClickOpen}> Change UserName </Button>
                    <Dialog open={open} onClose={() => handleClose(false)} >
                        <DialogTitle>Write your new username</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="New Username"
                                type="text"
                                fullWidth
                                variant="standard"

                                inputProps={{ maxLength: 12 }}
                                value={inputValue}
                                onChange={(event) => setInputValue(event.currentTarget.value)}
                                onKeyUp={(e) => { if (e.key === 'Enter') { handleClose(true) } }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleClose(true)}>Confirm</Button>
                            <Button onClick={() => handleClose(false)}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                    {!user.user?.twoFactorAuth ?
                        <div>
                            <Button className="buttonChange2FA" type="submit" onClick={handleClickOpen2FA}>
                                Activate 2FA
                            </Button>
                            <Dialog open={open2FA} onClose={handleClose2FA} >
                                <div>
                                    <DialogTitle>Scan the folowing QR code with Google authenticator</DialogTitle>
                                    <DialogContent className='2FA'>
                                        <img src={qrCode2FA} alt="QRcode" />
                                        <PinInput length={6}
                                            focus
                                            onChange={(value) => { }}
                                            type="numeric"
                                            inputMode="number"
                                            style={{ padding: '10px' }}
                                            onComplete={(value) => { send2FARequest(value) }}
                                            autoSelect={true} />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose2FA}>Cancel</Button>
                                    </DialogActions>
                                </div>
                            </Dialog>
                        </div> :
                        <div>
                            <Button className="buttonChange2FA" type="submit" onClick={handleClickOpen2FA2}>
                                Deactivate 2FA
                            </Button>
                            <Dialog open={open2FA2} onClose={handleClose2FA2} >
                                <div>
                                    <DialogTitle>Deactivate 2FA</DialogTitle>
                                    <DialogContent className='2FA'>
                                        <PinInput length={6}
                                            focus
                                            onChange={(value) => { }}
                                            type="numeric"
                                            inputMode="number"
                                            style={{ padding: '10px' }}
                                            onComplete={(value) => { send2FARequestDeactivate(value) }}
                                            autoSelect={true} />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose2FA2}>Cancel</Button>
                                    </DialogActions>
                                </div>
                            </Dialog>
                        </div>
                    }
                </div>
                <div className="stat">
                    <>
                        <div className="rectangle">
                            <div className="textRectangle">
                                <p>Wins</p>
                                {userDisplay.WinNumber}
                            </div>
                            <div className="textRectangle">
                                <h2 style={{ color: 'black' }}>Rank</h2>
                                <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '3px' }}>{userDisplay.Rank}</h3>
                            </div>
                            <div className="textRectangle">
                                <p>Losses</p>
                                {userDisplay.LossNumber}
                            </div>
                        </div>
                        {userMatchHistory.map((match) => {
                            return (
                                <div className={match.winner === user.user?.username ? 'itemWinner' : 'itemLoser'} key={match.id.toString()}>
                                    <div className="results" >
                                        <div className="name">{match.player1 === user.user?.username ? match.player1 : match.player2}</div>
                                        <div className="score">{match.player1 === user.user?.username ? match.score1 : match.score2}</div>
                                    </div>
                                    <div className="results">
                                        <div className="score">{match.player2 === user.user?.username ? match.score1 : match.score2}</div>
                                        <div className="name">{match.player2 === user.user?.username ? match.player1 : match.player2}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                </div>
                {
                    succes ? <FlashMessage
                        message={message} /> : ''
                }
                {
                    error ? <FlashMessage message2={message2} /> : ''
                }
            </div>
        </React.Fragment >
    )
};
export default Profile;
