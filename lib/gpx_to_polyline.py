import gpxpy
import polyline

# 读取 GPX 文件
with open("../public/track/20251018户外骑行.gpx", "r", encoding="utf-8") as f:
    gpx = gpxpy.parse(f)

# 遍历轨迹点
points = []
for track in gpx.tracks:
    for segment in track.segments:
        for point in segment.points:
            # GPS 坐标: [lat, lng]
            points.append([point.latitude, point.longitude])

# 转为 Google Encoded Polyline
encoded_polyline = polyline.encode(points)

# 输出
print("轨迹点数量:", len(points))
print("Encoded Polyline:", encoded_polyline)

# 可选：保存到文件
with open("../public/track/20251018户外骑行.txt", "w", encoding="utf-8") as f:
    f.write(encoded_polyline)
