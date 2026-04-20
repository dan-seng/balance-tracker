import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type DoughnutChartProps = {
  data: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
};

export function DoughnutChart({ data, size = 200, strokeWidth = 24 }: DoughnutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const animScale = useRef(new Animated.Value(0.4)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [animScale, animOpacity, data]);

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
           <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
           />
        </Svg>
      </View>
    );
  }

  let cumulativeAngle = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale: animScale }], opacity: animOpacity }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* We rotate by -90 so the first slice starts at 12 o'clock */}
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {data.map((item, index) => {
              if (item.value === 0) return null;
              
              const percentage = item.value / total;
              // Leave a tiny gap between slices for a highly premium look
              const arcPercentage = data.filter(d => d.value > 0).length > 1 ? Math.max(0, percentage - 0.02) : percentage;
              const strokeDashoffset = circumference - (arcPercentage * circumference);
              
              const sliceRotation = cumulativeAngle * 360;
              cumulativeAngle += percentage;

              return (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation={sliceRotation}
                  origin={`${size / 2}, ${size / 2}`}
                  strokeLinecap="round" // Sleek rounded segment edges
                />
              );
            })}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
