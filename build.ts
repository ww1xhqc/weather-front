// @deno-types="https://deno.land/x/deno/types/index.d.ts"

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// 生成Deno部署需要的静态资源结构
async function build() {
  try {
    // 运行Vue生产构建
    const buildProcess = Deno.run({
      cmd: ["npm", "run", "build"],
      stdout: "piped",
      stderr: "piped"
    });

    const [status, stdout, stderr] = await Promise.all([
      buildProcess.status(),
      buildProcess.output(),
      buildProcess.stderrOutput()
    ]);

    console.log(decoder.decode(stdout));
    console.error(decoder.decode(stderr));

    if (!status.success) {
      console.error("Vue build failed");
      Deno.exit(1);
    }

    // 创建Deno部署需要的目录结构
    await Deno.mkdir("dist", { recursive: true });
    
    // 添加404页面处理
    await Deno.copyFile("dist/index.html", "dist/404.html");

    console.log("✅ Build completed successfully");

  } catch (error) {
    console.error("Build error:", error);
    Deno.exit(1);
  }
}

build();
