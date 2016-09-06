cd public/style
lessc --autoprefix=">50%, last 10 Opera versions, last 4 op_mini versions, last 10 bb versions, last 10 and_ff versions, last 20 Chrome versions" --clean-css="--advanced --compatibility=ie8" main.less main.min.css
lessc --autoprefix=">50%, last 10 Opera versions, last 4 op_mini versions, last 10 bb versions, last 10 and_ff versions, last 20 Chrome versions" --clean-css="--advanced --compatibility=ie8" admin.less admin.min.css
