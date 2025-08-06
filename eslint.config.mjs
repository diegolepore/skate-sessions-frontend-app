import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/components/**/*",
      "src/hooks/**/*", 
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/*client*",
      "**/*client*",
      "**/*browser*",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/env",
              message: "Import env in server files only; use NEXT_PUBLIC_ vars in client.",
            },
          ],
          patterns: [],
        },
      ],
    },
  },
];

export default eslintConfig;
