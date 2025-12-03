
import { Box, Container, Typography } from "@mui/material";

export default function NextPage() {
  return (
    <Container maxWidth="lg">
      <Box>
        <Typography gutterBottom variant="h1">
          骑行预报
        </Typography>
      </Box>
      <Box>
        <Typography gutterBottom variant="body2">
          时间：2025年12月7日8:30
        </Typography>
        <Typography gutterBottom variant="body2">
          描述: 环巢湖156km 百戏城集合
        </Typography>
      </Box>
    </Container>
  );
}
