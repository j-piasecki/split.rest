interface Args {
  layout: { height: number }
  contentOffset: { y: number }
  contentSize: { height: number }
}

export const isCloseToBottom = ({ layout, contentOffset, contentSize }: Args) => {
  const paddingToBottom = 20
  return layout.height + contentOffset.y >= contentSize.height - paddingToBottom
}
