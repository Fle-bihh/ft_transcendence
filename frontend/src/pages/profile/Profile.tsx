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
import { User } from '../../state/type';

const cookies = new Cookies();
const jwt = cookies.get('jwt');
const options = {
    headers: {
        'authorization': `Bearer ${jwt}`
    }
}

const Profile = () => {

    const [firstOpen, setFirstOpen] = useState(true)
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector((state: RootState) => state.persistantReducer.userReducer);
    const [inputValue, setInputValue] = useState("")
    const [open, setOpen] = React.useState(false);
    //2FA
    const [open2FA, setOpen2FA] = React.useState(false);
    const [qrCode2FA, setQrCode2FA] = useState("");
    const [code2FA, setCode2FA] = useState("");
    const [res2FA, setRes2FA] = useState(0);
    const [codePin, setCodePin] = useState(0);
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
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (change: boolean) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        if (change && inputValue != "") {
            axios.patch(`http://localhost:5001/user/${user.user?.id}/username`, { username: inputValue }, options).then(response => {
                if (response.data != null) {
                    setUser(response.data)
                }
            })
            .catch(err => {
            console.log("data == ", err.response.data.message);
            });
            setInputValue("")
            setOpen(false);
        };
    }

    //2FA
    const handleClickOpen2FA = () => {
        setOpen2FA(true);
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://localhost:5001/user/${user.user?.id}/2fa/generate`, options).then(res => (setQrCode2FA(res.data)))
    };

    const handleClose2FA = () => {
        setOpen2FA(false);
        setQrCode2FA("")
        setCode2FA("")
        setRes2FA(0)
    };

    const send2FARequest = (value: string) => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://localhost:5001/user/${user.user?.id}/2fa/activate/` + value, options)
            .then(res => {
                setUser(res.data);
                setCode2FA('');
                setRes2FA(res.status);
            })
            .catch(err => {
                setRes2FA(err.response.status);
            });
    }

    const getUserData = () => {
        const jwt = cookies.get('jwt');
        const options = {
            headers: {
                'authorization': `Bearer ${jwt}`
            }
        }
        axios.get(`http://localhost:5001/game/${user.user?.id}`, options).then(response => {
            if (response.data != null) {
                response.data.map((data: any) => {
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
        console.log("fisrtOpen1", firstOpen)
        if (firstOpen)
            getUserData();

    }, [])

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
            url: `http://localhost:5001/user/${user.user?.id}/profileImage`,
            headers: options.headers,
            profileImage: formData,
            data: formData,
            withCredentials: true
        }
        axios(config).then((res) => {
            setUser(res.data);
        }).catch((err) => {
        })
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
                    <div className="infoUser">
                        <h3 className="userName">
                            Login :
                        </h3>
                        <Typography className="userNamePrint">
                            {user.user?.login}
                        </Typography>
                    </div>
                    <div className="infoUsername">
                        <h3 className="userNameChange">
                            userName :
                        </h3>
                        <Typography className="userNamePrintChange">
                            {user.user?.username}
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
                                        <img src={qrCode2FA} />
                                        <PinInput length={6}
                                            focus
                                            onChange={(value) => { setCode2FA(value); setRes2FA(0); setCodePin(0) }}
                                            type="numeric"
                                            inputFocusStyle={{ borderColor: '#f55951' }}
                                            inputMode="number"
                                            style={{ padding: '10px' }}
                                            onComplete={(value) => { send2FARequest(value); setCodePin(1); setCode2FA('') }}
                                            autoSelect={true} />
                                        <p className='wrong-code' style={{ display: 'none' }}>Wrong Code</p>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose2FA}>Cancel</Button>
                                    </DialogActions>
                                </div>
                            </Dialog>
                        </div> :
                        <div>
                            <Button className="buttonChange2FA" type="submit" onClick={() => {
                                const jwt = cookies.get('jwt');
                                const options = {
                                    headers: {
                                        'authorization': `Bearer ${jwt}`
                                    }
                                }
                                axios.get(`http://localhost:5001/user/${user.user?.id}/2fa/deactivate/`, options).then(res => {
                                    console.log('data', res.data)
                                    setUser(res.data)
                                })
                            }}>
                                Deactivate 2FA
                            </Button>
                        </div>
                    }
                </div>
                <div className="stat">
                    <>
                        <div className="rectangle">
                            <div className="textRectangle">
                                <p>nbr Win</p>
                                {user.user?.WinNumber}
                            </div>
                            <div className="textRectangle">
                                <h2 style={{ color: 'white' }}>Rank {user.user?.username}</h2>
                                <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '3px' }}>{user.user?.Rank}</h3>
                            </div>
                            <div className="textRectangle">
                                <p>nbr Loose</p>
                                {user.user?.LossNumber}
                            </div>
                        </div>
                        {userMatchHistory.map((match) => {
                            return (
                                <div className={match.winner == user.user?.username ? 'itemWinner' : 'itemLoser'} key={match.id.toString()}>
                                    <div className="results" >
                                        <div className="name">{match.player1 == user.user?.username ? match.player1 : match.player2}</div>
                                        <div className="score">-{match.player1 == user.user?.username ? match.score1 : match.score2}-</div>
                                    </div>
                                    <div className="results">
                                        <div className="score">-{match.player2 == user.user?.username ? match.score1 : match.score2}-</div>
                                        <div className="name">{match.player2 == user.user?.username ? match.player1 : match.player2}</div>

                                    </div>
                                </div>
                            )
                        })}
                    </>
                </div>
            </div>
        </React.Fragment >
    )
};
export default Profile;
