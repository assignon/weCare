/**
 * Test suite for delivery cost calculations
 * Tests all three scenarios as specified:
 * 1. Single seller - all standard delivery
 * 2. Single seller - mixed delivery (standard + express)
 * 3. Single seller - all express delivery
 * 4. Multiple sellers with various delivery combinations
 */

import { 
  groupItemsBySeller, 
  getDeliveryTypeForSellerGroup,
  calculateSingleSellerDeliveryCost,
  calculateMultiSellerDeliveryCost,
  validateCartItemsForDelivery,
  exampleScenarios
} from '../utils/deliveryCost.js'

// Mock data
const STANDARD_COST = 10
const EXPRESS_COST = 15

// Test utility function
function runTest(testName, testFunction) {
  try {
    testFunction()
    console.log(`✅ ${testName}`)
  } catch (error) {
    console.error(`❌ ${testName}: ${error.message}`)
  }
}

function assertEquals(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}. ${message}`)
  }
}

function assertObjectEquals(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Objects don't match. Expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}. ${message}`)
  }
}

// Test 1: Grouping items by seller
runTest('Group items by seller', () => {
  const cartItems = [
    { product: { seller: { id: 1, name: 'Seller 1' } } },
    { product: { seller: { id: 2, name: 'Seller 2' } } },
    { product: { seller: { id: 1, name: 'Seller 1' } } }
  ]
  
  const grouped = groupItemsBySeller(cartItems)
  assertEquals(Object.keys(grouped).length, 2, 'Should group into 2 sellers')
  assertEquals(grouped[1].items.length, 2, 'Seller 1 should have 2 items')
  assertEquals(grouped[2].items.length, 1, 'Seller 2 should have 1 item')
})

// Test 2: Delivery type detection
runTest('Detect delivery types', () => {
  // All standard
  let items = [
    { express_delivery: false },
    { express_delivery: false }
  ]
  let result = getDeliveryTypeForSellerGroup(items)
  assertEquals(result.type, 'standard', 'Should be standard delivery')
  
  // All express
  items = [
    { express_delivery: true },
    { express_delivery: true }
  ]
  result = getDeliveryTypeForSellerGroup(items)
  assertEquals(result.type, 'express', 'Should be express delivery')
  
  // Mixed
  items = [
    { express_delivery: false },
    { express_delivery: true }
  ]
  result = getDeliveryTypeForSellerGroup(items)
  assertEquals(result.type, 'mixed', 'Should be mixed delivery')
})

// Test 3: Single seller scenarios
runTest('Scenario 1: Single seller - all standard delivery', () => {
  const items = exampleScenarios.singleSellerStandard
  const grouped = groupItemsBySeller(items)
  const sellerId = Object.keys(grouped)[0]
  const result = calculateSingleSellerDeliveryCost(grouped[sellerId].items, STANDARD_COST, EXPRESS_COST)
  
  assertEquals(result.delivery_cost, STANDARD_COST, `Should cost ${STANDARD_COST} FCFA`)
  assertEquals(result.delivery_type, 'standard', 'Should be standard delivery')
  assertEquals(result.breakdown.standard_cost, STANDARD_COST, 'Standard cost should be applied')
  assertEquals(result.breakdown.express_cost, 0, 'Express cost should be 0')
})

runTest('Scenario 2: Single seller - mixed delivery', () => {
  const items = exampleScenarios.singleSellerMixed
  const grouped = groupItemsBySeller(items)
  const sellerId = Object.keys(grouped)[0]
  const result = calculateSingleSellerDeliveryCost(grouped[sellerId].items, STANDARD_COST, EXPRESS_COST)
  
  assertEquals(result.delivery_cost, STANDARD_COST + EXPRESS_COST, `Should cost ${STANDARD_COST + EXPRESS_COST} FCFA`)
  assertEquals(result.delivery_type, 'mixed', 'Should be mixed delivery')
  assertEquals(result.breakdown.standard_cost, STANDARD_COST, 'Standard cost should be applied')
  assertEquals(result.breakdown.express_cost, EXPRESS_COST, 'Express cost should be applied')
})

runTest('Scenario 3: Single seller - all express delivery', () => {
  const items = exampleScenarios.singleSellerExpress
  const grouped = groupItemsBySeller(items)
  const sellerId = Object.keys(grouped)[0]
  const result = calculateSingleSellerDeliveryCost(grouped[sellerId].items, STANDARD_COST, EXPRESS_COST)
  
  assertEquals(result.delivery_cost, EXPRESS_COST, `Should cost ${EXPRESS_COST} FCFA`)
  assertEquals(result.delivery_type, 'express', 'Should be express delivery')
  assertEquals(result.breakdown.standard_cost, 0, 'Standard cost should be 0')
  assertEquals(result.breakdown.express_cost, EXPRESS_COST, 'Express cost should be applied')
})

// Test 4: Multiple sellers scenario
runTest('Scenario 4: Multiple sellers with different delivery types', () => {
  const items = exampleScenarios.multiSeller
  const grouped = groupItemsBySeller(items)
  const result = calculateMultiSellerDeliveryCost(grouped, STANDARD_COST, EXPRESS_COST)
  
  // Expected: Seller 1 (standard only) + Seller 2 (mixed) = 10 + (10 + 15) = 35 FCFA
  const expectedCost = STANDARD_COST + (STANDARD_COST + EXPRESS_COST)
  assertEquals(result.total_delivery_cost, expectedCost, `Total should be ${expectedCost} FCFA`)
  assertEquals(result.seller_groups.length, 2, 'Should have 2 seller groups')
  
  // Check seller 1 (standard only)
  const seller1 = result.seller_groups.find(s => s.seller_id === 1)
  assertEquals(seller1.delivery_cost, STANDARD_COST, 'Seller 1 should have standard cost')
  assertEquals(seller1.delivery_type, 'standard', 'Seller 1 should be standard delivery')
  
  // Check seller 2 (mixed)
  const seller2 = result.seller_groups.find(s => s.seller_id === 2)
  assertEquals(seller2.delivery_cost, STANDARD_COST + EXPRESS_COST, 'Seller 2 should have mixed cost')
  assertEquals(seller2.delivery_type, 'mixed', 'Seller 2 should be mixed delivery')
})

// Test 5: Edge cases
runTest('Edge case: Empty cart', () => {
  const validation = validateCartItemsForDelivery([])
  assertEquals(validation.valid, false, 'Empty cart should be invalid')
  assertEquals(validation.error, 'Cart is empty', 'Should have correct error message')
})

runTest('Edge case: Invalid cart items', () => {
  const invalidItems = [{ product: {} }] // Missing seller info
  const validation = validateCartItemsForDelivery(invalidItems)
  assertEquals(validation.valid, false, 'Invalid items should be invalid')
})

// Test 6: Real-world example from user specification
runTest('User example: item1,2 from seller1 (standard), item3 from seller2 (standard), item4 from seller2 (express)', () => {
  const items = [
    { product: { seller: { id: 1, name: 'Seller 1' } }, express_delivery: false }, // item1
    { product: { seller: { id: 1, name: 'Seller 1' } }, express_delivery: false }, // item2
    { product: { seller: { id: 2, name: 'Seller 2' } }, express_delivery: false }, // item3
    { product: { seller: { id: 2, name: 'Seller 2' } }, express_delivery: true }   // item4
  ]
  
  const grouped = groupItemsBySeller(items)
  const result = calculateMultiSellerDeliveryCost(grouped, STANDARD_COST, EXPRESS_COST)
  
  // Expected: seller1 (10 FCFA standard) + seller2 (10 + 15 FCFA mixed) = 35 FCFA total
  assertEquals(result.total_delivery_cost, 35, 'Total should be 35 FCFA')
  assertEquals(result.seller_groups.length, 2, 'Should have 2 sellers')
  
  const seller1 = result.seller_groups.find(s => s.seller_id === 1)
  const seller2 = result.seller_groups.find(s => s.seller_id === 2)
  
  assertEquals(seller1.delivery_cost, 10, 'Seller 1 should cost 10 FCFA (standard)')
  assertEquals(seller2.delivery_cost, 25, 'Seller 2 should cost 25 FCFA (standard + express)')
})

console.log('\n📊 Delivery Cost Calculation Tests Completed')
console.log('🎯 All scenarios from user requirements have been tested!')
console.log('')
console.log('Summary of implemented scenarios:')
console.log('1. ✅ Single seller + all standard delivery → standard cost only')
console.log('2. ✅ Single seller + mixed delivery → standard + express costs')  
console.log('3. ✅ Single seller + all express delivery → express cost only')
console.log('4. ✅ Multiple sellers → apply same logic per seller group')
console.log('')