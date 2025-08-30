import { IStudentSlotBookingService } from './interfaces/IStudentSlotBookingService'
import { IStudentSlotBookingRepository } from '../../repositories/studentRepository/interfaces/IStudentSlotBookingRepository'
import { IStudentSlotRepository } from '../../repositories/studentRepository/interfaces/IStudentSlotRepository'
import { razorpay } from '../../utils/razorpay'
import { Types } from 'mongoose'
import { IWalletService } from '../genericService/interfaces/IWalletService'
import { IBooking } from '../../models/booking.Model'
import { IInstructor } from '../../models/instructor.Model'
import { PopulatedSlot } from '../../types/PopulatedSlot'
import { PopulatedBooking } from '../../types/PopulatedBooking'
import { SendEmail } from '../../utils/sendOtpEmail'
import { format } from 'date-fns'

// Service class responsible for handling slot booking operations for students
export class StudentSlotBookingService implements IStudentSlotBookingService {
  private readonly emailService: SendEmail

  constructor(
    private readonly bookingRepo: IStudentSlotBookingRepository, // Repository for booking records
    private readonly slotRepo: IStudentSlotRepository, // Repository for slot records
    private readonly walletService: IWalletService, // Wallet service for payments
  ) {
    this.emailService = new SendEmail() // Initialize email service for confirmations
  }

  // Step 1: Initiate checkout process with Razorpay
  async initiateCheckout(slotId: string, studentId: string) {
    // Validate slot and student IDs
    if (!Types.ObjectId.isValid(slotId)) throw new Error('Invalid slot ID')
    if (!Types.ObjectId.isValid(studentId)) throw new Error('Invalid student ID')

    // Fetch slot with instructor details
    const slot = (await this.slotRepo.findOne({ _id: slotId }, [
      { path: 'instructorId', select: 'username email' },
    ])) as PopulatedSlot

    // Slot validation
    if (!slot) throw new Error('Slot not found')
    if (slot.isBooked) throw new Error('Slot already booked')
    if (!slot.price || isNaN(slot.price)) throw new Error('Invalid slot price')

    // Generate receipt identifier (max 40 chars)
    const receipt = `slot-${slotId}-${studentId}-${Date.now()}`.substring(0, 40)

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(slot.price * 100), // amount in paise
      currency: 'INR',
      receipt,
      payment_capture: true,
    })

    // Return booking info along with payment order
    return {
      booking: {
        slotId: slot,
        instructorId: slot.instructorId as IInstructor,
      },
      razorpayOrder,
    }
  }

  // Step 2: Verify Razorpay payment and confirm booking
  async verifyPayment(
    slotId: string,
    studentId: string,
    razorpayPaymentId: string,
  ): Promise<IBooking> {
    // Validate IDs
    if (!Types.ObjectId.isValid(slotId) || !Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid IDs')
    }

    if (!razorpayPaymentId) throw new Error('Missing Razorpay payment ID')

    // Fetch slot
    const slot = await this.slotRepo.findById(slotId)
    if (!slot) throw new Error('Slot not found')
    if (slot.isBooked) throw new Error('Slot already booked')

    // Mark slot as booked
    await this.slotRepo.update(slot._id.toString(), { isBooked: true })

    // Credit instructor's wallet
    await this.walletService.creditWallet(
      new Types.ObjectId(slot.instructorId.toString()),
      slot.price,
      `Slot booking payment from student`,
      razorpayPaymentId,
    )

    // Create booking record
    const booking = await this.bookingRepo.createBooking({
      studentId: new Types.ObjectId(studentId),
      instructorId: slot.instructorId,
      slotId: slot._id,
      status: 'confirmed',
      paymentStatus: 'paid',
      txnId: razorpayPaymentId,
    })

    // Fetch full booking details with populated references
    const updatedBooking = await this.bookingRepo.findBookingById(booking._id.toString(), [
      { path: 'slotId' },
      { path: 'instructorId', select: 'username email' },
      { path: 'studentId', select: 'username email' },
    ])

    if (!updatedBooking) throw new Error('Failed to fetch updated booking')

    const populated = updatedBooking as PopulatedBooking

    // Send confirmation email to student
    await this.emailService.sendSlotBookingConfirmation(
      populated.studentId.username,
      populated.studentId.email,
      populated.instructorId.username,
      format(new Date(populated.slotId.startTime), 'dd/MM/yyyy'),
      format(new Date(populated.slotId.startTime), 'hh:mm a'),
      format(new Date(populated.slotId.endTime), 'hh:mm a'),
    )

    return populated
  }

  // Step 3: Book slot using student wallet balance (instead of Razorpay)
  async bookViaWallet(slotId: string, studentId: string): Promise<IBooking> {
    // Validate IDs
    if (!Types.ObjectId.isValid(slotId) || !Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid IDs')
    }

    // Fetch slot
    const slot = await this.slotRepo.findById(slotId)
    if (!slot) throw new Error('Slot not found')
    if (slot.isBooked) throw new Error('Slot already booked')

    const amount = slot.price
    const txnId = `wallet-slot-${Date.now()}` // Transaction ID for wallet booking

    // Deduct from student's wallet
    await this.walletService.debitWallet(
      new Types.ObjectId(studentId),
      amount,
      `Slot booking payment to instructor`,
      txnId,
    )

    // Credit instructor's wallet
    await this.walletService.creditWallet(
      new Types.ObjectId(slot.instructorId.toString()),
      amount,
      `Slot booked by student`,
      txnId,
    )

    // Mark slot as booked
    await this.slotRepo.update(slotId, { isBooked: true })

    // Create booking record
    const booking = await this.bookingRepo.createBooking({
      studentId: new Types.ObjectId(studentId),
      instructorId: slot.instructorId,
      slotId: slot._id,
      status: 'confirmed',
      paymentStatus: 'paid',
      txnId,
    })

    // Fetch full booking details with populated references
    const updatedBooking = await this.bookingRepo.findBookingById(booking._id.toString(), [
      { path: 'slotId' },
      { path: 'instructorId', select: 'username email' },
      { path: 'studentId', select: 'username email' },
    ])

    if (!updatedBooking) throw new Error('Failed to fetch updated booking')

    const populated = updatedBooking as PopulatedBooking

    // Send confirmation email
    await this.emailService.sendSlotBookingConfirmation(
      populated.studentId.username,
      populated.studentId.email,
      populated.instructorId.username,
      format(new Date(populated.slotId.startTime), 'dd/MM/yyyy'),
      format(new Date(populated.slotId.startTime), 'hh:mm a'),
      format(new Date(populated.slotId.endTime), 'hh:mm a'),
    )

    return populated
  }

  // Step 4: Get paginated booking history for a student
  async getStudentBookingHistoryPaginated(studentId: string, page: number, limit: number) {
    return await this.bookingRepo.findAllBookingsByStudentPaginated(studentId, page, limit, [
      { path: 'slotId' },
      { path: 'instructorId', select: 'username email' },
    ])
  }

  // Step 5: Get booking details by booking ID
  async getStudentBookingById(bookingId: string): Promise<IBooking | null> {
    if (!Types.ObjectId.isValid(bookingId)) throw new Error('Invalid booking ID')

    return await this.bookingRepo.findBookingById(bookingId, [
      { path: 'slotId' },
      { path: 'instructorId', select: 'username email' },
      { path: 'studentId', select: 'username email' },
    ])
  }
}
