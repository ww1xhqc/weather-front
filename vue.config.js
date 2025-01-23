module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.caiyunapp.com',
        changeOrigin: true,
        secure: false,
      pathRewrite: {
        '^/api': '/'  // 移除请求路径中的/api前缀
      },
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('Proxying request to:', proxyReq.path);
        },
        onProxyRes(proxyRes) {
          console.log('Received response with status:', proxyRes.statusCode);
        }
      }
    }
  }
}
