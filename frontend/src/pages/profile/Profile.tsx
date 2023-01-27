
import Navbar from '../../components/nav/Nav';
import * as React from 'react';
import "./profil.scss"
import Cerise from '../../styles/asset/cerise.jpg'
import Laurine from '../../styles/asset/ananas.png'

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../state';
import { useEffect, useState } from 'react';
import PinInput from 'react-pin-input';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { bindActionCreators } from 'redux';


// rajouter bouton activer A2FA ou non 

const Profile = () => {

    const [matchHistory, setMatchHistory] = React.useState(Array<{
        id: number,
        user1_login: string,
        user2_login: string, // class user
        user1_score: number,
        user2_score: number,
        winner_login: string,
    }>())

    const [firstOpen, setFirstOpen] = useState(true)
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector( (state: RootState) => state.persistantReducer.userReducer );
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
        getData : false,
    });

    const [userMatchHistory, setUserMatchHistory] = useState(
        Array<{
            player1id: string,
            score1: number,
            player2id: string,
            login2: number,
            winnerid: string, // login de la personne qui a gagné
        }>()
    );

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (change : boolean) => {
        if (change && inputValue != "")
        {
            axios.patch(`http://localhost:5001/user/${user.user?.id}/username`, { username: inputValue })
            userDisplay.username = inputValue;
        }
        setInputValue("")
        setOpen(false);
    };

    //2FA
    const handleClickOpen2FA = () => {
        setOpen2FA(true);
        axios.get('https://localhost:5001/auth/2fa/generate/').then(res => (setQrCode2FA(res.data)))
    };

    const handleClose2FA = () => {
        setOpen2FA(false);
        setQrCode2FA("")
		setCode2FA("")
		setRes2FA(0)
    };

    const send2FARequest = (value: string) => {
		axios.get('https://localhost:5001/auth/2fa/activate/' + value)
			.then(res => {
				setUser(res.data);
				setCode2FA('');
				setRes2FA(res.status);
			})
			.catch(err => {
				setRes2FA(err.response.status);
			});
	}

    // useEffect(() => {
	// 	const wrongCode = document.querySelector<HTMLElement>('.wrong-code')!;
	// 	if (codePin && res2FA === 401) {
	// 		if (wrongCode)
	// 			wrongCode.style.display = 'block';
	// 	} else {
	// 		if (wrongCode)
	// 			wrongCode.style.display = 'none';
	// 	}
	// }, [res2FA]);
    //fin 2FA

    const getUserData = () => {
        axios.get(`http://localhost:5001/user/id/${user.user?.id}`).then(response => {
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
                    setFirstOpen(false)
                }
            }).catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
        console.log("effect : ", userDisplay)
        if (!userDisplay?.getData)
            getUserData();
    }, [userDisplay?.getData])

    return (
        <React.Fragment >
            <Navbar />
            <div className="profilePageContainer">
                <div className="profile" >
                    <Stack direction="row" spacing={2} className="avatarItem">
                        {/* <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            className="avatarItem"
                        > */}
                        <img alt="Cerise" src={userDisplay?.profileImage} className="avatar" />
                    </Stack>
                    <Button className="avatarChange" type="submit">
                        Change Profile Picture
                    </Button>
                    <InputText type="file" />
                    <div className="infoUser">
                        <h3 className="userName">
                            Login :
                            </h3>
                        <Typography className="userNamePrint">
                            {userDisplay?.login}
                        </Typography>

                    </div>
                    <div className="infoUsername">

                        <h3 className="userNameChange">
                            userName :
                            </h3>
                        <Typography className="userNamePrintChange">
                            {userDisplay?.username}
                        </Typography>

                    </div>
                    {/* setMatchHistory([...matchHistory, { id: matchHistory.length, user1_login: user.user!.username, user2_login: 'wWWWWWWWW', user1_score: 1, user2_score: 3, winner_login: 'Cerise' }]) */}
                    <Button className="buttonChange" type="submit" onClick={handleClickOpen}> Change UserName </Button>
                    <Dialog  open={open} onClose={() => handleClose(false)} >
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
                    { !user.user?.twoFactorAuth ? 
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
                        <Button className="buttonChange2FA" type="submit" onClick={() => { axios.get('https://localhost:5001/auth/2fa/deactivate/').then(res => { setUser(res.data) }) }}>
                            Deactivate 2FA
                        </Button>
                    </div>
                    }
                </div>
                <div className="stat">

                    <div className="rectangle">
                        <div className="textRectangle">
                            <p>nbr Win</p>
                            {userDisplay?.WinNumber}
                        </div>
                        <div className="textRectangle">
                            <h2 style={{ color: 'white' }}>Rank {userDisplay?.username}</h2>
                            {/* <h3 style={{ textAlign: 'center' }}>Number of parts</h3> */}
                            <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '3px' }}>{matchHistory.length}</h3>
                        </div>
                        <div className="textRectangle">
                            <p>nbr Loose</p>
                            {userDisplay?.LossNumber}
                        </div>
                    </div>

                    {matchHistory.map((match) => {
                        return (
                            <div className={match.winner_login == user.user!.username ? 'itemWinner' : 'itemLoser'} key={match.id.toString()}  >

                                <div className="results" >
                                    <div className="name">{match.user1_login}</div>
                                    <div className="score">-{match.user1_score.toString()}-</div>

                                </div>

                                <div className="results" >

                                    <Avatar alt="Cerise" src={Cerise}
                                        className="avatarStatuser" variant="square" />

                                    <Avatar alt="Laurine" src={Laurine}
                                        className="avatarStatuser" variant="square" />
                                </div>
                                <div className="results">
                                    <div className="score">-{match.user2_score.toString()}-</div>
                                    <div className="name">{match.user2_login}</div>
                                </div>


                            </div>
                        )
                    })}
                    {/* spacing={5} */}


                </div>
            </div>
        </React.Fragment >

    )
};
export default Profile;