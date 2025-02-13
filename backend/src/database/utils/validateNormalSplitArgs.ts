import { BadRequestException } from '../../errors/BadRequestException'
import { CreateSplitArguments, UpdateSplitArguments } from 'shared'

export function validateNormalSplitArgs(args: CreateSplitArguments | UpdateSplitArguments) {
  if (args.balances.findIndex(({ id }) => id === args.paidBy) === -1) {
    throw new BadRequestException('api.split.payerNotInTransaction')
  }

  const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
  const othersLose = args.balances.reduce(
    (sum, { id, change }) => (id !== args.paidBy ? sum + Number(change) : sum),
    0
  )

  if (payerGetsBack && Math.abs(Number(payerGetsBack) - Math.abs(othersLose)) > 0.01) {
    throw new BadRequestException('api.split.payerMustGetBackSumOthersLose')
  }
}
