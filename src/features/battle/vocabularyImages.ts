import u1Bag from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/01_bag.png'
import u1Book from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/02_book.png'
import u1Pen from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/03_pen.png'
import u1Pencil from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/04_pencil.png'
import u1PencilCase from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/05_pencil_case.png'
import u1Rubber from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/06_rubber.png'
import u1Board from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/07_board.png'
import u1Bookcase from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/08_bookcase.png'
import u1Cupboard from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/09_cupboard.png'
import u1Window from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/10_window.png'
import u1Door from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/11_door.png'
import u1Paper from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/12_paper.png'
import u1Wall from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/13_wall.png'
import u1Desk from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/14_desk.png'
import u1Chair from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/15_chair.png'
import u1Teacher from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/16_teacher.png'
import u1Crayons from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/17_crayons.png'
import u1Ruler from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/18_ruler.png'
import u1Playground from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/19_playground.png'
import u1Classroom from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_1/20_classroom.png'
import u2Eye from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/01_eye.png'
import u2Nose from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/02_nose.png'
import u2Mouth from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/03_mouth.png'
import u2Ear from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/04_ear.png'
import u2Face from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/05_face.png'
import u2Head from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/06_head.png'
import u2Hair from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/07_hair.png'
import u2Arm from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/08_arm.png'
import u2Leg from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/09_leg.png'
import u2Foot from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_2/10_foot.png'
import u3Cat from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/01_cat.png'
import u3Dog from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/02_dog.png'
import u3Goat from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/03_goat.png'
import u3Sheep from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/04_sheep.png'
import u3Horse from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/05_horse.png'
import u3Cow from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/06_cow.png'
import u3Donkey from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/07_donkey.png'
import u3Duck from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/08_duck.png'
import u3Chicken from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/09_chicken.png'
import u3Spider from '../../../assets/Power_Up_1_Units_1_3_Assets/Unit_3/10_spider.png'
import type { UnitId } from '../../domain/types'

export const battleVocabularyImages: Partial<Record<UnitId, Readonly<Record<string, string>>>> = {
  'unit-1': {
    bag: u1Bag, book: u1Book, pen: u1Pen, pencil: u1Pencil, 'pencil case': u1PencilCase,
    rubber: u1Rubber, board: u1Board, bookcase: u1Bookcase, cupboard: u1Cupboard, window: u1Window,
    door: u1Door, paper: u1Paper, wall: u1Wall, desk: u1Desk, chair: u1Chair, teacher: u1Teacher,
    crayon: u1Crayons, ruler: u1Ruler, playground: u1Playground, classroom: u1Classroom,
  },
  'unit-2': { eye: u2Eye, nose: u2Nose, mouth: u2Mouth, ear: u2Ear, face: u2Face, head: u2Head, hair: u2Hair, arm: u2Arm, leg: u2Leg, foot: u2Foot },
  'unit-3': { cat: u3Cat, dog: u3Dog, goat: u3Goat, sheep: u3Sheep, horse: u3Horse, cow: u3Cow, donkey: u3Donkey, duck: u3Duck, chicken: u3Chicken, spider: u3Spider },
}
