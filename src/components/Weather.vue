<template>
  <div class="weather-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="weather-data">
      <div class="location">
        <h2>当前位置</h2>
        <p>经度: {{ location[1] }}, 纬度: {{ location[0] }}</p>
      </div>

      <div class="current-weather">
        <h2>当前天气</h2>
        <div class="weather-grid">
          <div class="weather-item">
            <span>温度</span>
            <span>{{ temperature }}°C</span>
          </div>
          <div class="weather-item">
            <span>体感温度</span>
            <span>{{ apparentTemperature }}°C</span>
          </div>
          <div class="weather-item">
            <span>湿度</span>
            <span>{{ humidity }}%</span>
          </div>
          <div class="weather-item">
            <span>天气状况</span>
            <span>{{ skycon }}</span>
          </div>
          <div class="weather-item">
            <span>风速</span>
            <span>{{ windSpeed }} m/s</span>
          </div>
          <div class="weather-item">
            <span>风向</span>
            <span>{{ windDirection }}°</span>
          </div>
          <div class="weather-item">
            <span>气压</span>
            <span>{{ pressure }} hPa</span>
          </div>
          <div class="weather-item">
            <span>能见度</span>
            <span>{{ visibility }} km</span>
          </div>
        </div>
      </div>

      <div class="air-quality">
        <h2>空气质量</h2>
        <div class="aqi-grid">
          <div class="aqi-item">
            <span>PM2.5</span>
            <span>{{ pm25 }} μg/m³</span>
          </div>
          <div class="aqi-item">
            <span>PM10</span>
            <span>{{ pm10 }} μg/m³</span>
          </div>
          <div class="aqi-item">
            <span>AQI (中国标准)</span>
            <span>{{ aqiChn }}</span>
          </div>
          <div class="aqi-item">
            <span>空气质量</span>
            <span>{{ aqiDescChn }}</span>
          </div>
        </div>
      </div>

      <div class="life-index">
        <h2>生活指数</h2>
        <div class="index-grid">
          <div class="index-item">
            <span>紫外线指数</span>
            <span>{{ uvIndex }} ({{ uvDesc }})</span>
          </div>
          <div class="index-item">
            <span>舒适度指数</span>
            <span>{{ comfortIndex }} ({{ comfortDesc }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WeatherDisplay',
  data() {
    return {
      loading: true,
      error: null,
      location: [],
      temperature: null,
      apparentTemperature: null,
      humidity: null,
      skycon: null,
      windSpeed: null,
      windDirection: null,
      pressure: null,
      visibility: null,
      pm25: null,
      pm10: null,
      aqiChn: null,
      aqiDescChn: null,
      uvIndex: null,
      uvDesc: null,
      comfortIndex: null,
      comfortDesc: null
    };
  },
  async created() {
    try {
      const response = await axios.get('/v2.6/OMFSneNpNxLXXUOf/115.011638,32.753972/realtime', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        baseURL: process.env.VUE_APP_API_BASE_URL || '/api'
      });
      console.log('Request URL:', response.config.url);
      console.log('Response Status:', response.status);
      console.log('API Response:', response);
      const data = response.data.result.realtime;
      
      this.location = response.data.location;
      this.temperature = data.temperature;
      this.apparentTemperature = data.apparent_temperature;
      this.humidity = (data.humidity * 100).toFixed(0);
      // 天气现象翻译和优先级处理
      const weatherMap = {
        'CLEAR_DAY': '晴',
        'CLEAR_NIGHT': '晴',
        'PARTLY_CLOUDY_DAY': '多云',
        'PARTLY_CLOUDY_NIGHT': '多云',
        'CLOUDY': '阴',
        'LIGHT_HAZE': '轻度雾霾',
        'MODERATE_HAZE': '中度雾霾',
        'HEAVY_HAZE': '重度雾霾',
        'LIGHT_RAIN': '小雨',
        'MODERATE_RAIN': '中雨',
        'HEAVY_RAIN': '大雨',
        'STORM_RAIN': '暴雨',
        'FOG': '雾',
        'LIGHT_SNOW': '小雪',
        'MODERATE_SNOW': '中雪',
        'HEAVY_SNOW': '大雪',
        'STORM_SNOW': '暴雪',
        'DUST': '浮尘',
        'SAND': '沙尘',
        'WIND': '大风'
      };

      // 根据实际数据判断天气现象
      let currentSkycon = data.skycon;
      const cloudrate = data.cloudrate;
      const humidity = data.humidity;
      const windSpeed = data.wind.speed;
      
      // 空气质量数据提前获取
      const aqi = data.air_quality;
      
      // 优先级判断
      if (aqi.pm25 >= 200) {
        currentSkycon = 'HEAVY_HAZE';
      } else if (aqi.pm25 >= 150) {
        currentSkycon = 'MODERATE_HAZE';
      } else if (aqi.pm25 >= 100) {
        currentSkycon = 'LIGHT_HAZE';
      } else if (aqi.pm10 > 150 && humidity < 0.3) {
        currentSkycon = windSpeed >= 6 ? 'SAND' : 'DUST';
      } else if (data.precipitation.local.intensity > 0) {
        // 这里需要根据降水强度判断雨雪类型
        const temp = data.temperature;
        currentSkycon = temp < 0 ? 'LIGHT_SNOW' : 'LIGHT_RAIN';
      } else if (cloudrate > 0.8) {
        currentSkycon = 'CLOUDY';
      } else if (cloudrate > 0.2) {
        currentSkycon = data.is_day ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
      } else {
        currentSkycon = data.is_day ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
      }

      this.skycon = weatherMap[currentSkycon];
      this.windSpeed = data.wind.speed;
      this.windDirection = data.wind.direction;
      this.pressure = (data.pressure / 100).toFixed(2);
      this.visibility = data.visibility;
      
      // 设置空气质量显示值
      this.pm25 = aqi.pm25;
      this.pm10 = aqi.pm10;
      this.aqiChn = aqi.aqi.chn;
      this.aqiDescChn = aqi.description.chn;
      
      // Life index
      const life = data.life_index;
      this.uvIndex = life.ultraviolet.index;
      this.uvDesc = life.ultraviolet.desc;
      this.comfortIndex = life.comfort.index;
      this.comfortDesc = life.comfort.desc;
      
    } catch (error) {
      this.error = '获取天气数据失败，请稍后重试';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.weather-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background: linear-gradient(to bottom right, #f8f9fd, #e6f0ff);
  min-height: 100vh;
}

.loading, .error {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 40px;
  color: #4a5568;
}

.weather-data {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.weather-grid, .aqi-grid, .index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.weather-item, .aqi-item, .index-item {
  background: rgba(255, 255, 255, 0.98);
  padding: 25px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.weather-item:hover, .aqi-item:hover, .index-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(66, 153, 225, 0.2);
}

.weather-item span:first-child,
.aqi-item span:first-child,
.index-item span:first-child {
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 0.95rem;
}

.weather-item span:last-child,
.aqi-item span:last-child,
.index-item span:last-child {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a202c;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.weather-item span:last-child::after {
  content: attr(data-unit);
  font-size: 0.85rem;
  font-weight: 500;
  color: #718096;
  position: absolute;
  right: -1.4em;
  bottom: 0.4em;
  opacity: 0.9;
  transition: all 0.2s ease;
}

.weather-item:hover span:last-child::after {
  opacity: 1;
  transform: translateX(2px);
}

h2 {
  color: #2d3748;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  font-size: 1.5rem;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4299e1 0%, #63b3ed 100%);
  border-radius: 2px;
}

/* 空气质量特殊样式 */
.aqi-item[style*="background: #f5f5f5"] {
  background: rgba(255, 255, 255, 0.95) !important;
}

.aqi-item span:last-child {
  position: relative;
  padding-left: 24px;
}

.aqi-item span:last-child::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #48bb78;
  box-shadow: 0 2px 6px rgba(72, 187, 120, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.aqi-item:hover span:last-child::before {
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.aqi-item[style*="良"] span:last-child::before { background: #48bb78; }
.aqi-item[style*="轻度污染"] span:last-child::before { background: #ecc94b; }
.aqi-item[style*="中度污染"] span:last-child::before { background: #ed8936; }
.aqi-item[style*="重度污染"] span:last-child::before { background: #f56565; }

/* 天气图标 */
.weather-item[data-skycon="CLEAR_DAY"]::before {
  content: "☀️";
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.weather-item[data-skycon="CLOUDY"]::before {
  content: "☁️";
  font-size: 1.8rem;
  margin-bottom: 8px;
}

/* 风速风向特殊样式 */
.weather-item:nth-child(5) span:last-child::after {
  content: "→";
  margin-left: 8px;
  transform: rotate(22deg);
  display: inline-block;
}
</style>
