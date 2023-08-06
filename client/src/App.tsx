// TODO: free weight memory when unmount

import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { fetchFile } from './utils';

import {Container,Box, Typography, Divider, Fab, Grid, List, ListItem, ListItemText, Paper, TextField, IconButton, Slider, FormControl, InputLabel, Select, MenuItem, Button} from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
// import 'react-chat-elements/dist/main.css'
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import TextsmsIcon from '@mui/icons-material/Textsms';
import GitHubIcon from '@mui/icons-material/GitHub';
import ParamSlider from './components/ParamSlider';
import qrcode from "qrcode-terminal"

const drawerWidth = 240;

const OPEN_WORDS = "我也许是第一个能直接运行在网页上的GPT类中文模型，我还在进化中，目前参数只有15M，所以聊天能力也许……不过试着多陪我聊会吧，没准会有惊喜哦 o‿≖✧"
const ERROR_WORDS = "some error happened, please click the RELOAD button at the sidebar...";
const DEFAULT_LOG = "inference speed: N/A";

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '50vh'}}>
      <Box sx={{ minWidth: 150 }}>
        <Typography variant="body2" color="text.primary">Loading Model...</Typography>
      </Box>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

interface Message {
  role: "user" | "bot";
  data: string;
  neglect?: boolean;
  warning?: boolean;
}


interface MessageProps {
  message: Message
}

const MessageItem = ({message}: MessageProps) => {
  const {role, data, warning} = message;
  return (
    <ListItem sx={{display: "flex", width: "100%"}}>
      {(role ==="user") && <div style={{flex: 1}}></div>}
      <Paper  sx={{p: '10px'}}>
        <ListItemText  primary={data} className={warning?"warning-text":""}></ListItemText>
      </Paper>
      {(role ==="bot") && <div style={{flex: 1}}></div>}
    </ListItem>
  )
}

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [loaded, setLoaded] = useState(false) 
  const [busy, setBusy] = useState(false)

  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState(DEFAULT_LOG);

  //the temporary answer of the chatbot
  const [answer, setAnswer] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {role: "bot", data: OPEN_WORDS, neglect: true},
  ]);

  const [T, setT] = useState(0.9);
  const [maxNewTokens, setMaxNewTokens] = useState(32);
  const [maxMemoTokens, setMaxMemoTokens] = useState(64);

  const resetMessages = () => {
    setMessages([
      {role: "bot", data: OPEN_WORDS, neglect: true},
    ])
    setLog(DEFAULT_LOG)
  }


  const buildFinalPrompt = (prompt: string) => {
    return messages.filter(m => !m.neglect).map(m => {
      return m.role === "user"? ` A: ${m.data.trim()}`:` B: ${m.data.trim()}`
    }).join(' ') + " B: "
  }

  const refScroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when a new message is added
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages((prevState) => ([...prevState, message]));
  }

  const botReply = (data: string, warning:boolean=false) => {
    console.log("replying...");
    setMessages((prevState) => ([...prevState, {role: "bot", data, warning}]));
  }


  const updateProgress = (progress: number) => {
    setProgress(progress*100)
  }

  useEffect(()=>{

    // 先定义_yum_global 再定义 Module， 否则可能影响和c代码的配合
    window._yum_global = {
      setLoaded,
      setAnswer,
      setBusy,
      setLog,
      botReply,
    }

    window.Module = {
      onRuntimeInitialized : async () => {
        
        console.log("loading...");

        let model_url = 'https://huggingface.co/rayvvv/yumchat_cn/resolve/main/model.bin';
        let model_path = "model.bin";
        let model_blob = await fetchFile(model_url, updateProgress);
        let model_data = new Uint8Array(await model_blob.arrayBuffer());
        window.FS.writeFile(model_path, model_data);

        let token_url = 'https://huggingface.co/rayvvv/yumchat_cn/resolve/main/tokenizer16000.bin';
        let token_path = "tokenizer16000.bin";
        let token_blob = await fetchFile(token_url);
        let token_data = new Uint8Array(await token_blob.arrayBuffer());
        window.FS.writeFile(token_path, token_data);
        try {
          window.Module.ccall('init', null, ['string', 'string'], [model_path, token_path])
          console.log("loaded");
          console.log("对portable 大模型技术感兴趣的朋友欢迎一起交流学习 wx：");
          qrcode.generate("https://u.wechat.com/EO2vh4ZLImDjS8c1-iMNqrE");
        } catch(e) {
          botReply(ERROR_WORDS, true)
        }
      },
      print: function(text: string) {
        console.log(text);
      }
    }
  }, [])





  const handleInputChange =(e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleSubmit = useCallback(() => {
    if (prompt.trim() !== '' && (!busy)) {
      addMessage({role: "user", data: prompt.trim()})
      setPrompt("");
    }
  },[prompt, busy])

  useEffect(()=>{
    const lastMessage = messages[messages.length - 1];
    if(busy) {
      console.log("busy...");
      return 
    }

    if (lastMessage.role === "user") {
      const finalPrompt = buildFinalPrompt(prompt)
      
      try {
        window.Module.ccall('chat'
        , null, ['string', 'number', 'number', 'number'], [finalPrompt, T, maxNewTokens, maxMemoTokens], { async: true })

      } catch(e) {
        botReply(ERROR_WORDS, true)
      }


    }
  }, [messages, busy, T, maxNewTokens, maxMemoTokens, prompt])


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Perform your submit action here
      handleSubmit();
    }
  };

  const handleClean = () => {
    window.Module?.ccall && window.Module.ccall('cleanup', null, [], []);
    window.location.reload();
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            chatTiny
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <TextsmsIcon/>
          </IconButton>
          <Typography component="div" sx={{ flexGrow: 1 }}>
          </Typography>
          <IconButton
            component="a"
            href="https://github.com/hku/portable-llama2"
            target='_blank'
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <GitHubIcon/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >


        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{
           p: 1, 
           height: "100%", 
           display: "flex",
           flexDirection: "column",
          //  justifyContent: "space-between"
          }}>

        {/* <Typography gutterBottom  variant="h6" color="text.primary"> Portable LLama2 15M </Typography> */}
        
        <FormControl fullWidth>
          <InputLabel >model</InputLabel>
          <Select
            value={0}
            label="model"
          >
            <MenuItem value={0}>Portable LLama2 15M</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{m:3}} />

        <ParamSlider min={0} max={1.5} step={0.01} defaultValue={T} label={"temperature"} onChange={t=>setT(t)}/>

        <Box sx={{m:3}} />
        
        <ParamSlider min={16} max={128} step={1} defaultValue={maxNewTokens} label={"max_new_tokens"} onChange={n=>setMaxNewTokens(n)}/>

        <Box sx={{m:3}} />
        <ParamSlider min={16} max={128} step={1} defaultValue={maxMemoTokens} label={"max_memory_tokens"} onChange={n=>setMaxMemoTokens(n)}/>
        <Typography component="div" sx={{ flexGrow: 1 }}>
        </Typography>
        <Box>
          <Button fullWidth sx={{color: '#0f0'}} onClick={handleClean}>reload</Button>
        </Box>

        </Box>


      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Container>
        {loaded?
        <Grid container>
          <Grid item xs={12} sx={{}}>
            <div style={{
              "position": 'relative',
              maxWidth: "600px", 
              margin: "10px auto",
            }}>
              <div ref={refScroll} style={{ height: '70vh', padding: "10px 0",  overflowY: 'auto'}}>
                <List >
                  {messages.map((m, idx)=><MessageItem message={m} key={idx}/>)}
                </List>
                <Box sx={{padding: "10px"}}>
                  <Typography className='flicker-text' variant="body2" align='left' color="text.secondary">{`>_${answer}`}</Typography>
                </Box>
              </div>

              {messages.length>1 && <Box sx={{
                position: 'absolute',
                right: '-100px',
                bottom: '20px',
                color: '#0f0',
                zIndex: 200
              }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={resetMessages}
              >
                <DeleteOutlineIcon/>
              </IconButton>
              </Box>}
            </div>
              <div><Typography className="log-text" variant="body2" align='left' color="text.secondary">{log}</Typography>
              </div>
            <Divider />
          </Grid>
          <Grid container style={{padding: '20px 0'}} spacing={1}>
            <Grid item xs={11}>
                <TextField value={prompt} 
                onKeyDown={handleKeyDown}
                onChange={handleInputChange} 
                label="chat with me" fullWidth />
            </Grid>
            <Grid item xs={1}>
                <Fab color="primary" aria-label="add" onClick={handleSubmit}><SendIcon /></Fab>
            </Grid>
          </Grid>
        </Grid>:
        <LinearProgressWithLabel value={progress}/>
        }
      </Container>
      </Main>
    </Box>
  );
}
