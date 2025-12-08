import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/X';
import { Chat, ContactPhone, LocalPhone, WhatsApp } from '@mui/icons-material';
import Email from '@mui/icons-material/Email';

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
      {'Copyright © '}
      <Link color="text.secondary" href="https://chaohucyclingclub.com/">
        ChaohuCycling Club
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <React.Fragment>
      <Divider />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 4, sm: 8 },
          py: { xs: 8, sm: 10 },
          textAlign: { sm: 'center', md: 'left' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: { xs: '100%', sm: '60%' },
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
         
              <Typography
                variant="body2"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Join the newsletter
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Subscribe for weekly updates. No spams ever!
              </Typography>
              <InputLabel htmlFor="email-newsletter">Email</InputLabel>
              <Stack direction="row" spacing={1} useFlexGap>
                <TextField
                  id="email-newsletter"
                  hiddenLabel
                  size="small"
                  variant="outlined"
                  fullWidth
                  aria-label="Enter your email address"
                  placeholder="Your email address"
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'off',
                      'aria-label': 'Enter your email address',
                    },
                  }}
                  sx={{ width: '250px' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  Subscribe
                </Button>
              </Stack>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              俱乐部介绍
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              活动列表
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              活动详情
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              路线列表
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              俱乐部新闻
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              训练计划 / 数据统计
            </Link>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              会员中心
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              商城 / 周边
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              新闻 / 博客列表
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              新闻 / 博客详情
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              相册
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              商城
            </Link>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              俱乐部公告
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              赛事专区
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              训练计划/数据
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              社区 / 论坛
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              联系我们
            </Link>
            <Link color="text.secondary" variant="body2" href="/test">
              问答
            </Link>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: { xs: 4, sm: 8 },
            width: '100%',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <div>
            <Link color="text.secondary" variant="body2" href="#">
              Privacy Policy
            </Link>
            <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
              &nbsp;•&nbsp;
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              Terms of Service
            </Link>
            <Copyright />
          </div>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: 'left', color: 'text.secondary' }}
          >
            <IconButton
              color="inherit"
              size="small"
              href="https://chaohucyclingclub.com"
              aria-label="GitHub"
              sx={{ alignSelf: 'center' }}
            >
              <Email />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://chaohucyclingclub.com"
              aria-label="X"
              sx={{ alignSelf: 'center' }}
            >
              <LocalPhone />
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://chaohucyclingclub.com"
              aria-label="LinkedIn"
              sx={{ alignSelf: 'center' }}
            >
              <WhatsApp />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </React.Fragment>
  );
}
