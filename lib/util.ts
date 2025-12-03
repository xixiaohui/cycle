export const CYCLE_TEXT: string[] = [
  `以骑行之名，与巢湖（漅湖）相伴\n沿着湖走，遇见风，遇见自己\n因为热爱，所以同行`,

  `巢湖位于中国安徽省中部的合肥市境内，涉及1区（包河区）、1县级市（巢湖市）及3县（肥东、肥西、庐江）的20个乡镇，地处长江淮河之间。总面积约775km²，东西长61km，南北均宽12km，是安徽省最大的湖泊，位列传统中国五大淡水湖之一。巢湖夜月为昔日庐阳八景之第七景。`,

  `巢湖之名始于先秦，因其位于古巢国之地而得名，其源头可追溯至有巢氏。后世又有以湖似巢状或因居巢县而得名的说法。古时为区别于地名“巢”、城名“鄛”，又叫漅湖（“漅”，拼音：jiǎo，南京官话：ziao3，子小切），民间误写做焦湖。`,

  `巢湖位于中新生代形成的巢湖断陷盆地南部，形成与更新世发育的河谷平原上，距今约一万年，属于河成型湖泊，当时面积约有2000km²。湖区属北亚热带季风气候，年均气温16.1℃。四周分布着银屏山、凤凰山、冶父山、大别山、防虎山等，流域总面积13130km²，其中巢湖闸上面积9130km²，闸下面积4000km²。流域内河流共33条，分别属杭埠河-丰乐河、派河、南淝河-店埠河、柘皋河、白石山河、兆河、裕溪河7大水系，其主要出入河流有9条，分别为合肥市巢湖市、庐江县境内的南淝河、十五里河、派河、柘皋河、双桥河、兆河、白石天河（白石天河后汇引入杭蚌河）、裕溪河等河，以及流经六安市舒城县与合肥市肥西县的杭埠河，其中入湖水量最大的是杭埠河，约占总入湖水量的60％左右。裕溪河是巢湖唯一的出水通道，同时最后经由裕溪口汇入长江。`,

  `湖泊类型:	淡水湖\n
  主要流入:	杭埠河、南淝河、十五里河、派河、柘皋河、双桥河、兆河、白石天河、烔炀河等\n
  主要流出:	裕溪河\n
  集水面积:	12938 km2\n
  所在国家:	中国\n
  最大长度:	61 千米\n
  最大宽度:	12 千米\n
  表面积:	775 平方千米\n
  平均深度:	2.69 米\n
  最大深度:	3.77 米\n
  水体体积:	20.7×108 m3\n
  岸长:	181 千米\n
  岛屿:	姥山岛、孤山岛\n
  定居点:	合肥市、长临河镇、严店乡、三河镇、盛桥镇、同大镇、白山镇、巢湖市、中庙街道、黄麓镇、烔炀镇、中垾镇、散兵镇、槐林镇`,
];

export const formatDateSmart = (dateString: string) => {
  if (!dateString) return "";

  // 判断是否为 ISO 格式
  const isISO =
    dateString.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateString);

  if (!isISO) return dateString;

  const date = new Date(dateString);

  // 强制转为上海时间
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  const h = parts.find((p) => p.type === "hour")?.value;
  const mm = parts.find((p) => p.type === "minute")?.value;

  return `${y}年${m}月${d}日 ${h}:${mm}`;
};

export const formatKeepUTC = (str: string) => {
  return str.replace("+00", "");
};

export type RidingPlan = {
  id: string;
  title: string;
  description?: string | null;

  start_time: string;  // Supabase timestamptz -> string
  end_time?: string | null;

  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  distance_km?: number | null;
  difficulty?: "简单" | "普通" | "困难" | string;

  cover_url?: string | null;

  created_at: string;
  user_id: string;
};