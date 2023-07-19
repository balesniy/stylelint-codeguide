import isCustomProperty from '../../utils/isCustomProperty'
import isStandardSyntaxProperty from '../../utils/isStandardSyntaxProperty'
import parseSelector from '../../utils/parseSelector'
import report from '../../utils/report'
import ruleMessages from '../../utils/ruleMessages'
import validateOptions from '../../utils/validateOptions'

export const ruleName = `root-no-standard-properties`

export const messages = ruleMessages(ruleName, {
	rejected: (property) => `Unexpected standard property "${property}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/root-no-standard-properties/README.md`,
	fixable: false,
}

/** @type {import('stylelint').Rule} */
const rule = (actual) => (root, result) => {
	const validOptions = validateOptions(result, ruleName, { actual })
	if (!validOptions) {
		return
	}

	root.walkRules(/:root/i, (cssRule) => {
		parseSelector(cssRule.selector, result, cssRule, checkSelector)

		function checkSelector (selectorAST) {
			if (ignoreRule(selectorAST)) {
				return
			}

			cssRule.each((node) => {
				if (node.type !== `decl`) {
					return
				}

				const prop = node.prop

				if (!isStandardSyntaxProperty(prop)) {
					return
				}
				if (isCustomProperty(prop)) {
					return
				}

				report({
					message: messages.rejected(prop),
					node,
					result,
					ruleName,
				})
			})
		}
	})
}

function ignoreRule (selectorAST) {
	let ignore = false
	selectorAST.walk((selectorNode) => {
		// ignore `:root` selector inside a `:not()` selector
		if (selectorNode.value && selectorNode.value.toLowerCase() === `:root` && selectorNode.parent.parent.value && selectorNode.parent.parent.value.toLowerCase() === `:not`) {
			ignore = true
		}
	})
	return ignore
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
