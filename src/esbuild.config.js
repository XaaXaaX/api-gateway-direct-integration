const handlerPath = "./handlers";
const bundledPath = "../build";

const AllEntries = [];
AllEntries.push(`${handlerPath}/validateDynamodbStream/index.ts`);
AllEntries.push(`${handlerPath}/validateQueueMessages/index.ts`);
AllEntries.push(`${handlerPath}/validateRequest/index.ts`);

require('esbuild').build({
    entryPoints: AllEntries,
    entryNames: '[dir]/[name]',
    outbase:'.',
    bundle: true,
    minify: process.env.NODE_ENV === "dev" ? false : true,
    sourcemap: false,
    outdir: `${bundledPath}`,
    platform: 'node',
    write: true,
    external: [
        "aws-sdk"
    ]
}).catch(() => process.exit());
