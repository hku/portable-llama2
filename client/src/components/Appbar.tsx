import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import TextsmsIcon from '@mui/icons-material/Textsms';
import GitHubIcon from '@mui/icons-material/GitHub';
export default function ChatAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            TinyChat
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
            href="https://huggingface.co/rayvvv/yumchat_cn"
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
    </Box>
  );
}