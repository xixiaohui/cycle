"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // 支持 Markdown 表格
import { Box } from "@mui/material";

const markdown = `
| 区间     | 名称                             | 强度说明                  | 功率/心率参考                      | 训练目的              |
| ------ | ------------------------------ | --------------------- | ---------------------------- | ----------------- |
| **Z1** | 活动恢复（Active Recovery）          | 非常轻松，几乎不用费力           | 50–60% HRmax 或 <55% FTP      | 轻松骑行、促进血液循环和恢复    |
| **Z2** | 耐力区（Endurance）                 | 舒适骑行，可以长时间保持          | 60–70% HRmax 或 55–75% FTP    | 提升有氧耐力，基础耐力训练     |
| **Z3** | 节奏区（Tempo）                     | 中等强度，有明显努力感，但可持续1–2小时 | 70–80% HRmax 或 76–90% FTP    | 提高乳酸阈、骑行节奏控制      |
| **Z4** | 乳酸阈区（Threshold）                | 高强度，可维持约 20–60 分钟     | 80–90% HRmax 或 91–105% FTP   | 提升乳酸阈，增强耐高强度骑行能力  |
| **Z5** | VO2max/冲刺区（VO2max / Anaerobic） | 非常高强度，只能维持几分钟         | 90–100% HRmax 或 106–120% FTP | 增强最大有氧能力、爆发力和冲刺能力 |
`;

export default function TrainingZonesTable() {
  return (
    <Box sx={{ overflowX: "auto", p: 1 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                border: "1px solid #f3ebd3",
                padding: "7px",
                backgroundColor: "#1c1f33",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{ border: "1px solid #f3ebd3", padding: "7px" }}
              {...props}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
}
