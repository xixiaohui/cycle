/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Footer from "@/components/Footer";
import { parseGpx } from "@/lib/parseGpx";
import { Button, Stack, Typography, Alert, CircularProgress, Container, Box } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";



export function GpxUpload({ trackId }: { trackId: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const points = parseGpx(text);

      if (!points.length) {
        throw new Error("GPX 文件中没有轨迹点");
      }

      console.log("解析到的轨迹点：", points);

      const res = await fetch(`/api/tracks/${trackId}/points/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      if (!res.ok) {
        throw new Error("轨迹点导入失败");
      }

      alert(`成功导入 ${points.length} 个点`);
    } catch (e: any) {
      setError(e.message || "导入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        component="label"
        startIcon={loading ? <CircularProgress size={18} /> : <UploadFileIcon />}
        disabled={loading}
      >
        选择 GPX 文件
        <input
          type="file"
          accept=".gpx"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </Button>

      {fileName && (
        <Typography variant="body2" color="text.secondary">
          已选择文件：{fileName}
        </Typography>
      )}

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}

const History_track_id_1 = "12418b8c-bb76-423c-826f-8174050affcd";
const History_track_id_2 = "2b53b00d-8be4-4b19-9db8-a5b5c756c6a3";

export default function ToolPage() {
  return (
    <Container maxWidth="lg">
      <Box>
        <Typography gutterBottom variant="h1">
          Tools
        </Typography>
      </Box>

      <GpxUpload trackId={History_track_id_2}></GpxUpload>
      
      <Footer></Footer>
    </Container>
  );
}
