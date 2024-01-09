// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import React, {
  forwardRef,
  useMemo,
  FocusEventHandler,
  MouseEventHandler,
} from "react"
import styled from "styled-components"
const optionId = "wheel-picker-option-"
const Item = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: left;
  cursor: pointer;
  ${(props: { height: number }): string => `
      min-height: ${props.height}px;
    `}
  &:focus {
    outline: none;
  }
`

const Text = styled.p`
  margin: auto;
  text-align: center;
  word-wrap: break-word;
`

export interface WheelPickerItemProps {
  id: string
  value: string | number
  activeID: string
  height: number
  color: string
  activeColor: string
  fontSize: number
  onClick?: MouseEventHandler
  onFocus?: FocusEventHandler
}

const WheelPickerItem: React.FC<WheelPickerItemProps> = (
  { id, value, activeID, height, onClick, onFocus },
  ref
) => {
  const selected = useMemo(() => id === activeID, [id, activeID])
  return (
    <Item
      role="option"
      aria-selected={selected}
      aria-label={value.toString()}
      ref={ref}
      id={`${optionId}${id}`}
      data-itemid={id}
      data-itemvalue={value}
      height={height}
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={0}
    >
      {/* {selected && <Icon fontSize={fontSize}>&#10003;</Icon>}
        <span style={{ width: ICON_WIDTH }}></span> */}
      {/* <div style={{width:"100%",backgroundColor:"red"}}>
        <Text style={textStyle}>{value}</Text>
        </div> */}
      {selected ? (
        <Text
          style={{
            color: "#293B75",
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: "-0.02rem",
            lineHeight: "2rem",
            borderTop: "2px white solid",
            borderBottom: "2px white solid",
          }}
        >
          {value}
        </Text>
      ) : (
        <Text
          style={{
            color: " #666667",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "-0.01rem",
            lineHeight: "1.25rem",
            opacity: 0.5,
          }}
        >
          {value}
        </Text>
      )}
    </Item>
  )
}

export default forwardRef<HTMLLIElement, WheelPickerItemProps>(WheelPickerItem)
