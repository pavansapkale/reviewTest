import { useDrag } from '@use-gesture/react'
import { a, useSpring, config } from '@react-spring/web'
import { ReactNode, SetStateAction, useEffect, useState } from 'react'
import styles from './styles.module.css'

type typeSheetProps = {
  children: ReactNode,
  defaultVisible?: boolean,
  showClose?: boolean,
  heading?: string,
  onVisible: (status: boolean) => void,
  height:number,
  isDraggable:boolean
}

const defaultSheetProps: typeSheetProps = {
  children: <div>No Content</div>,
  defaultVisible: true,
  showClose: true,
  heading: "",
  onVisible: function(){},
  height:380,
  isDraggable:true
}

const BottomSheet = (props: typeSheetProps) => {
  const {height}=props
  
  const [{ y }, api] = useSpring(() => ({ y: height }))

  useEffect(()=>{
    (props.defaultVisible) ? open({ canceled: props.defaultVisible }) : (null)
  },[props.defaultVisible])
  
  const open = ({ canceled }: any) => {
    api.start({ y: 0, immediate: false, config: canceled ? config.gentle : config.stiff })
  }

  const close = (velocity = 0) => {
    props.onVisible(false)
    api.start({ y: height, immediate: false, config: { ...config.stiff, velocity } })
  }

  const bind = useDrag(
    ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel, canceled }) => {
      if(props.isDraggable){
        if (my < -70) cancel()
        if (last) {
          my > height * 0.5 || (vy > 0.5 && dy > 0) ? close(vy) : open({ canceled })
        }else {
          api.start({ y: my, immediate: true })
        }
      }
    },
    { from: () => [0, y.get()], filterTaps: true, bounds: { top: 0 }, rubberband: true }
  )

  // const display = y.to((py) => (py < height ? 'block' : 'none'))

  const bgStyle = {
    transform: y.to([0, height], ['translateY(-8%) scale(1.16)', 'translateY(0px) scale(1.05)']),
    opacity: y.to([0, height], [0.4, 1], 'clamp')
  }

  return (
    <div
        className={
          "z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 " +
          ((props.defaultVisible) ? "visible" : "invisible top-full")
        }
      >
    <div className="flex overflow-hidden">
      <a.div className={styles.sheet} {...bind()} style={{ bottom: `calc(-100% + ${height - 100}px)`, y }}>
        <p className="bg-background rounded-full mt-3 h-1 w-20 mb-5 mx-auto"></p>
        <div className="flex flex-col mx-5">

          {/* HEADING  */}
          <div className="flex justify-center items-center">
              <h1 className="font-bold text-2xl text-right">
                {props.heading}
              </h1>
          </div>

          {/* CLOSE BUTTON  */}
          {props.showClose && 
            <div
              className="h-6 w-6 p-1 rounded-full bg-background absolute right-4 top-4"
              onClick={() => { close() }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4L4 12L12 4Z" fill="#B3B3B3" />
                <path
                  d="M12 4L4 12"
                  stroke="#B3B3B3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12L4 4"
                  stroke="#B3B3B3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            }

          {/* CONTENT  */}
          <div className="flex justify-center">
            {props.children}
          </div>
        </div>
      </a.div>
    </div>
    </div>
  )
}

BottomSheet.defaultProps = defaultSheetProps

export default BottomSheet
