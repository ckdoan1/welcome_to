import { useState } from 'react'
import './App.css'
import HouseLot from './components/HouseLot'

// Houses with pool option (0-indexed)
const ROW1_POOLS = [2, 6, 7] // 3rd, 7th, 8th
const ROW2_POOLS = [0, 3, 7] // 1st, 4th, 8th
const ROW3_POOLS = [1, 6, 10] // 2nd, 7th, 11th

function App() {
  // State for row 1 (10 houses)
  const [row1, setRow1] = useState(
    Array(10).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  // State for row 2 (11 houses)
  const [row2, setRow2] = useState(
    Array(11).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  // State for row 3 (12 houses)
  const [row3, setRow3] = useState(
    Array(12).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  const updateRow1House = (index, field, value) => {
    setRow1(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  const updateRow2House = (index, field, value) => {
    setRow2(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  const updateRow3House = (index, field, value) => {
    setRow3(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  return (
    <div className="app">
      <div className="welcome-container">
        <div className="glow-orb"></div>
        <div className="glow-orb secondary"></div>

        <h1 className="welcome-title">
          <span className="wave">👋</span> Welcome to
        </h1>

        <div className="house-row">
          {row1.map((house, index) => (
            <HouseLot
              key={index}
              number={house.number}
              onNumberChange={(val) => updateRow1House(index, 'number', val)}
              topButton={ROW1_POOLS.includes(index) ? true : null}
              onTopButtonClick={() => updateRow1House(index, 'poolActive', !house.poolActive)}
              poolActive={house.poolActive}
              showLeftFence={index === 0}
              leftFenceActive={house.leftFenceActive}
              onLeftFenceClick={() => updateRow1House(index, 'leftFenceActive', !house.leftFenceActive)}
              rightFenceActive={house.rightFenceActive}
              onRightFenceClick={() => updateRow1House(index, 'rightFenceActive', !house.rightFenceActive)}
            />
          ))}
        </div>

        <div className="house-row">
          {row2.map((house, index) => (
            <HouseLot
              key={index}
              number={house.number}
              onNumberChange={(val) => updateRow2House(index, 'number', val)}
              topButton={ROW2_POOLS.includes(index) ? true : null}
              onTopButtonClick={() => updateRow2House(index, 'poolActive', !house.poolActive)}
              poolActive={house.poolActive}
              showLeftFence={index === 0}
              leftFenceActive={house.leftFenceActive}
              onLeftFenceClick={() => updateRow2House(index, 'leftFenceActive', !house.leftFenceActive)}
              rightFenceActive={house.rightFenceActive}
              onRightFenceClick={() => updateRow2House(index, 'rightFenceActive', !house.rightFenceActive)}
            />
          ))}
        </div>

        <div className="house-row">
          {row3.map((house, index) => (
            <HouseLot
              key={index}
              number={house.number}
              onNumberChange={(val) => updateRow3House(index, 'number', val)}
              topButton={ROW3_POOLS.includes(index) ? true : null}
              onTopButtonClick={() => updateRow3House(index, 'poolActive', !house.poolActive)}
              poolActive={house.poolActive}
              showLeftFence={index === 0}
              leftFenceActive={house.leftFenceActive}
              onLeftFenceClick={() => updateRow3House(index, 'leftFenceActive', !house.leftFenceActive)}
              rightFenceActive={house.rightFenceActive}
              onRightFenceClick={() => updateRow3House(index, 'rightFenceActive', !house.rightFenceActive)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

