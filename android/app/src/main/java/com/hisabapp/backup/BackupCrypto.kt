package com.hisabapp.backup

import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

internal object BackupCrypto {
    const val MAX_BYTES = 32 * 1024 * 1024
    private val header = "HISAB_BACKUP_V1\n".toByteArray(Charsets.US_ASCII)
    private const val SALT_SIZE = 16
    private const val NONCE_SIZE = 12
    private const val ITERATIONS = 600_000
    private fun key(password: String, salt: ByteArray): SecretKeySpec {
        require(password.length >= 8) { "PASSWORD" }
        val spec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, 256)
        return try {
            val bytes = try {
                SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
            } catch (_: java.security.NoSuchAlgorithmException) {
                // Older Android providers may not expose the SHA-256 factory.
                // Derive the identical RFC 8018 key using their HMAC primitive.
                val mac = javax.crypto.Mac.getInstance("HmacSHA256")
                mac.init(SecretKeySpec(password.toByteArray(Charsets.UTF_8), "HmacSHA256"))
                var block = mac.doFinal(salt + byteArrayOf(0, 0, 0, 1))
                val result = block.copyOf()
                repeat(ITERATIONS - 1) {
                    block = mac.doFinal(block)
                    for (index in result.indices) result[index] = (result[index].toInt() xor block[index].toInt()).toByte()
                }
                result
            }
            SecretKeySpec(bytes, "AES").also { bytes.fill(0) }
        } finally { spec.clearPassword() }
    }
    fun encrypt(plain: ByteArray, password: String): ByteArray {
        require(plain.size <= MAX_BYTES) { "TOO_LARGE" }
        val random = SecureRandom()
        val salt = ByteArray(SALT_SIZE).also(random::nextBytes)
        val nonce = ByteArray(NONCE_SIZE).also(random::nextBytes)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key(password, salt), GCMParameterSpec(128, nonce))
        cipher.updateAAD(header)
        return header + salt + nonce + cipher.doFinal(plain)
    }
    fun decrypt(file: ByteArray, password: String): ByteArray {
        val offset = header.size + SALT_SIZE + NONCE_SIZE
        require(file.size in (offset + 16)..(MAX_BYTES + offset + 16)) { "INVALID_FILE" }
        require(file.copyOfRange(0, header.size).contentEquals(header)) { "INVALID_FILE" }
        val salt = file.copyOfRange(header.size, header.size + SALT_SIZE)
        val nonce = file.copyOfRange(header.size + SALT_SIZE, offset)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key(password, salt), GCMParameterSpec(128, nonce))
        cipher.updateAAD(header)
        return cipher.doFinal(file, offset, file.size - offset)
    }
}
