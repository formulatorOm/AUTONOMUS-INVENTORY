import express from 'express';
import {
    getIngredients,
    getIngredientsById,
    updateIngredients,
    deleteingredients,
    createingredients
} from '../controllers/ingredientsController.js';
const router = express.Router();
router.get('/', getIngredients)
router.get('/:id', getIngredientsById)
router.post('/', createingredients)
router.put('/:id', updateIngredients)
router.delete('/:id', deleteingredients)
export default router;