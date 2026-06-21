<template>
  <view class="swiper-module">
    <swiper
      class="swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      :circular="true"
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#ffffff"
    >
      <swiper-item v-for="item in list" :key="item.id" @click="onClick(item)">
        <image class="swiper-image" :src="item.image" mode="aspectFill" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  name: 'SwiperModule',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onClick(item) {
      if (item.link) {
        this.$tab.navigateTo(item.link)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.swiper-module {
  width: 100%;
}

.swiper {
  width: 100%;
  height: 360rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}
</style>
