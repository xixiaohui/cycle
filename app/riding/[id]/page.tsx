import RidingDetailClient from "./RidingDetailClient";

interface Props {
  params: { id: string };
}

export default async function Page({ params }: Props) {

  const { id } = await params; // 从路由参数获取 planId

  // console.log(id)

  return <RidingDetailClient planId={id} />;

}