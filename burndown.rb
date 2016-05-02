# DEBT BURNDOWN CHART
require 'active_support'
require 'active_support/core_ext'
require 'date'

# debts = [
#   { name: "MacBook",       total: 300,    min_payment: 100 },
#   { name: "Art Van",       total: 1_400,  min_payment: 100 },
#   { name: "Cruze",         total: 5_400,  min_payment: 285 },
#   { name: "Jacob's loans", total: 9_900,  min_payment: 100 },
#   { name: "Amex",          total: 1_300,  min_payment: 500 },
#   { name: "Jenna's loans", total: 15_000, min_payment: 200 },
#   # { name: "State Taxes", total: ?,      min_payment: ?},
#   # { name: "Fed Taxes",   total: ?,      min_payment: ?},
# ]

debts = [
  { name: "Jacob's loans", total: 12_000, min_payment: 180 },
  { name: "MacBook",       total: 200,    min_payment: 50  },
  { name: "Jenna's loans", total: 35_000, min_payment: 200 },
  { name: "Art Van",       total: 400,    min_payment: 100 },
  { name: "Cruze",         total: 8_000,  min_payment: 285 },
  { name: "Amex",          total: 2_300,  min_payment: 500 },
]

remaining_debts        = debts.reject  {|d| d[:total] == 0 }.sort_by! {|d| d[:total] }
monthly_payments_total = debts.inject(0) {|sum, debt| sum + debt[:min_payment] }
total_debt             = debts.inject(0) {|sum, debt| sum + debt[:total] }
milestones             = []
date                   = Date.today
leftover               = 0

puts "total_debt: #{total_debt}"
until total_debt == 0
  # leftover should == 0 at the start of every month
  remaining_debts = remaining_debts.reject {|d| d[:total] <= 0 }.sort_by! {|d| d[:total] }

  remaining_debts.each do |debt|
    # pay the leftover, or the total if it's less
    leftover_payment = [debt[:total], leftover].min
    debt[:total]    -= leftover_payment
    leftover        -= leftover_payment

    # pay the minimum, unless it's more than the total
    payment       = [debt[:total], debt[:min_payment]].min
    debt[:total] -= payment
    leftover     += debt[:min_payment] - payment

    milestones << {name: "Paid off #{debt[:name]} in #{date.month}/#{date.year}"} if debt[:total] == 0
    puts "milestone! Paid off #{debt[:name]} in #{date.month}/#{date.year}" if debt[:total] == 0
  end

  total_debt = remaining_debts.inject(0) {|sum, debt| sum + debt[:total] }
  date += 1.month
end

puts milestones
puts "you paid #{monthly_payments_total} each month except for the final month in which you paid #{monthly_payments_total - leftover}"
puts "money leftover: #{leftover}"

# would be nice to make a graph: Y-axis = total debt, X-axis = date by month/year
# Y-axis layered with colors for each debt, ascending vertically from largest to smallest